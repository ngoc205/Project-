const fs = require('fs');
const path = require('path');
const sql = require('../QuanLyTruongTieuHoc-BE/node_modules/mssql');

const dbName = process.env.DB_DATABASE || 'PriSchool';
const outputFile = path.resolve(__dirname, '..', 'File SQL');

const config = {
  server: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT || 1433),
  user: process.env.DB_USERNAME || 'sa',
  password: process.env.DB_PASSWORD || 'Thuong@0702',
  database: dbName,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  },
};

function q(name) {
  return `[${String(name).replace(/]/g, ']]')}]`;
}

function literal(value, typeName = '') {
  if (value === null || value === undefined) return 'NULL';
  if (Buffer.isBuffer(value)) return `0x${value.toString('hex')}`;
  if (value instanceof Date) {
    const iso = value.toISOString();
    if (['date'].includes(typeName)) return `'${iso.slice(0, 10)}'`;
    return `'${iso.replace('T', ' ').replace('Z', '').replace(/\.\d+$/, '')}'`;
  }
  if (typeof value === 'number') return Number.isFinite(value) ? String(value) : 'NULL';
  if (typeof value === 'boolean') return value ? '1' : '0';
  return `N'${String(value).replace(/'/g, "''")}'`;
}

function columnType(column) {
  const type = column.type_name.toLowerCase();
  if (['varchar', 'char', 'varbinary', 'binary'].includes(type)) {
    return `${type.toUpperCase()}(${column.max_length === -1 ? 'MAX' : column.max_length})`;
  }
  if (['nvarchar', 'nchar'].includes(type)) {
    return `${type.toUpperCase()}(${column.max_length === -1 ? 'MAX' : column.max_length / 2})`;
  }
  if (['decimal', 'numeric'].includes(type)) {
    return `${type.toUpperCase()}(${column.precision},${column.scale})`;
  }
  if (['datetime2', 'datetimeoffset', 'time'].includes(type)) {
    return `${type.toUpperCase()}(${column.scale})`;
  }
  return type.toUpperCase();
}

async function query(pool, text) {
  return (await pool.request().query(text)).recordset;
}

function sortTables(tables, foreignKeys) {
  const names = tables.map((table) => table.name);
  const remaining = new Set(names);
  const ordered = [];

  while (remaining.size) {
    let progressed = false;
    for (const table of names) {
      if (!remaining.has(table)) continue;
      const deps = foreignKeys
        .filter((fk) => fk.parent_table === table && fk.referenced_table !== table)
        .map((fk) => fk.referenced_table);
      if (deps.every((dep) => !remaining.has(dep))) {
        ordered.push(table);
        remaining.delete(table);
        progressed = true;
      }
    }
    if (!progressed) {
      ordered.push(...remaining);
      break;
    }
  }

  return ordered;
}

async function main() {
  const pool = await sql.connect(config);

  const tables = await query(pool, `
    SELECT t.object_id, t.name
    FROM sys.tables t
    WHERE SCHEMA_NAME(t.schema_id) = 'dbo'
    ORDER BY t.name
  `);

  const columns = await query(pool, `
    SELECT
      t.name AS table_name,
      c.name AS column_name,
      ty.name AS type_name,
      c.max_length,
      c.precision,
      c.scale,
      c.is_nullable,
      c.is_identity,
      ic.seed_value,
      ic.increment_value,
      dc.definition AS default_definition,
      c.column_id
    FROM sys.tables t
    JOIN sys.columns c ON c.object_id = t.object_id
    JOIN sys.types ty ON ty.user_type_id = c.user_type_id
    LEFT JOIN sys.identity_columns ic ON ic.object_id = c.object_id AND ic.column_id = c.column_id
    LEFT JOIN sys.default_constraints dc ON dc.parent_object_id = c.object_id AND dc.parent_column_id = c.column_id
    WHERE SCHEMA_NAME(t.schema_id) = 'dbo'
    ORDER BY t.name, c.column_id
  `);

  const primaryKeys = await query(pool, `
    SELECT
      t.name AS table_name,
      kc.name AS constraint_name,
      c.name AS column_name,
      ic.key_ordinal
    FROM sys.key_constraints kc
    JOIN sys.tables t ON t.object_id = kc.parent_object_id
    JOIN sys.index_columns ic ON ic.object_id = kc.parent_object_id AND ic.index_id = kc.unique_index_id
    JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = ic.column_id
    WHERE kc.type = 'PK' AND SCHEMA_NAME(t.schema_id) = 'dbo'
    ORDER BY t.name, ic.key_ordinal
  `);

  const uniqueConstraints = await query(pool, `
    SELECT
      t.name AS table_name,
      kc.name AS constraint_name,
      c.name AS column_name,
      ic.key_ordinal
    FROM sys.key_constraints kc
    JOIN sys.tables t ON t.object_id = kc.parent_object_id
    JOIN sys.index_columns ic ON ic.object_id = kc.parent_object_id AND ic.index_id = kc.unique_index_id
    JOIN sys.columns c ON c.object_id = t.object_id AND c.column_id = ic.column_id
    WHERE kc.type = 'UQ' AND SCHEMA_NAME(t.schema_id) = 'dbo'
    ORDER BY t.name, kc.name, ic.key_ordinal
  `);

  const checks = await query(pool, `
    SELECT t.name AS table_name, cc.name AS constraint_name, cc.definition
    FROM sys.check_constraints cc
    JOIN sys.tables t ON t.object_id = cc.parent_object_id
    WHERE SCHEMA_NAME(t.schema_id) = 'dbo'
    ORDER BY t.name, cc.name
  `);

  const foreignKeyColumns = await query(pool, `
    SELECT
      fk.name AS constraint_name,
      parent.name AS parent_table,
      pc.name AS parent_column,
      ref.name AS referenced_table,
      rc.name AS referenced_column,
      fkc.constraint_column_id,
      fk.delete_referential_action_desc
    FROM sys.foreign_keys fk
    JOIN sys.tables parent ON parent.object_id = fk.parent_object_id
    JOIN sys.tables ref ON ref.object_id = fk.referenced_object_id
    JOIN sys.foreign_key_columns fkc ON fkc.constraint_object_id = fk.object_id
    JOIN sys.columns pc ON pc.object_id = parent.object_id AND pc.column_id = fkc.parent_column_id
    JOIN sys.columns rc ON rc.object_id = ref.object_id AND rc.column_id = fkc.referenced_column_id
    WHERE SCHEMA_NAME(parent.schema_id) = 'dbo'
    ORDER BY parent.name, fk.name, fkc.constraint_column_id
  `);

  const foreignKeys = Object.values(
    foreignKeyColumns.reduce((acc, row) => {
      acc[row.constraint_name] ||= {
        constraint_name: row.constraint_name,
        parent_table: row.parent_table,
        referenced_table: row.referenced_table,
        delete_referential_action_desc: row.delete_referential_action_desc,
        parent_columns: [],
        referenced_columns: [],
      };
      acc[row.constraint_name].parent_columns.push(row.parent_column);
      acc[row.constraint_name].referenced_columns.push(row.referenced_column);
      return acc;
    }, {}),
  );

  const orderedTables = sortTables(tables, foreignKeys);
  const output = [];

  output.push('-- Script tạo database PriSchool và dữ liệu hiện có.');
  output.push('-- Chạy toàn bộ file này trong SSMS sau khi clone project.');
  output.push('');
  output.push('USE master;');
  output.push('GO');
  output.push(`IF DB_ID(N'${dbName.replace(/'/g, "''")}') IS NULL`);
  output.push(`BEGIN`);
  output.push(`    CREATE DATABASE ${q(dbName)};`);
  output.push(`END`);
  output.push('GO');
  output.push(`USE ${q(dbName)};`);
  output.push('GO');
  output.push('');
  output.push('-- Xóa bảng cũ để seed lại dữ liệu sạch.');
  for (const table of [...orderedTables].reverse()) {
    output.push(`IF OBJECT_ID(N'dbo.${table.replace(/'/g, "''")}', N'U') IS NOT NULL DROP TABLE dbo.${q(table)};`);
  }
  output.push('GO');

  for (const table of orderedTables) {
    const tableColumns = columns.filter((column) => column.table_name === table);
    output.push('');
    output.push(`CREATE TABLE dbo.${q(table)} (`);
    output.push(
      tableColumns
        .map((column) => {
          const identity = column.is_identity ? ` IDENTITY(${column.seed_value || 1},${column.increment_value || 1})` : '';
          const nullable = column.is_nullable ? 'NULL' : 'NOT NULL';
          const defaultValue = column.default_definition ? ` DEFAULT ${column.default_definition}` : '';
          return `    ${q(column.column_name)} ${columnType(column)}${identity} ${nullable}${defaultValue}`;
        })
        .join(',\n'),
    );
    output.push(');');
    output.push('GO');

    const pkRows = primaryKeys.filter((pk) => pk.table_name === table);
    if (pkRows.length) {
      output.push(`ALTER TABLE dbo.${q(table)} ADD CONSTRAINT ${q(pkRows[0].constraint_name)} PRIMARY KEY (${pkRows.map((pk) => q(pk.column_name)).join(', ')});`);
      output.push('GO');
    }
  }

  for (const table of orderedTables) {
    const tableColumns = columns.filter((column) => column.table_name === table);
    const identityColumn = tableColumns.find((column) => column.is_identity);
    const rows = await query(pool, `SELECT * FROM dbo.${q(table)} ORDER BY ${tableColumns.map((column) => q(column.column_name)).join(', ')}`);
    if (!rows.length) continue;

    output.push('');
    output.push(`-- Dữ liệu bảng ${table}`);
    if (identityColumn) output.push(`SET IDENTITY_INSERT dbo.${q(table)} ON;`);

    const columnList = tableColumns.map((column) => q(column.column_name)).join(', ');
    const typeByColumn = Object.fromEntries(tableColumns.map((column) => [column.column_name, column.type_name.toLowerCase()]));
    output.push(`INSERT INTO dbo.${q(table)} (${columnList}) VALUES`);
    output.push(
      rows
        .map((row, index) => {
          const values = tableColumns.map((column) => literal(row[column.column_name], typeByColumn[column.column_name])).join(', ');
          return `(${values})${index === rows.length - 1 ? ';' : ','}`;
        })
        .join('\n'),
    );
    if (identityColumn) output.push(`SET IDENTITY_INSERT dbo.${q(table)} OFF;`);
    output.push('GO');
  }

  const uniqueGroups = Object.values(
    uniqueConstraints.reduce((acc, row) => {
      acc[row.constraint_name] ||= { table_name: row.table_name, constraint_name: row.constraint_name, columns: [] };
      acc[row.constraint_name].columns.push(row.column_name);
      return acc;
    }, {}),
  );

  if (uniqueGroups.length || checks.length || foreignKeys.length) {
    output.push('');
    output.push('-- Ràng buộc sau khi seed dữ liệu.');
  }

  for (const group of uniqueGroups) {
    output.push(`ALTER TABLE dbo.${q(group.table_name)} ADD CONSTRAINT ${q(group.constraint_name)} UNIQUE (${group.columns.map(q).join(', ')});`);
    output.push('GO');
  }

  for (const check of checks) {
    output.push(`ALTER TABLE dbo.${q(check.table_name)} ADD CONSTRAINT ${q(check.constraint_name)} CHECK ${check.definition};`);
    output.push('GO');
  }

  for (const fk of foreignKeys) {
    const deleteAction = fk.delete_referential_action_desc === 'NO_ACTION'
      ? ''
      : ` ON DELETE ${fk.delete_referential_action_desc.replace('_', ' ')}`;
    output.push(
      `ALTER TABLE dbo.${q(fk.parent_table)} ADD CONSTRAINT ${q(fk.constraint_name)} FOREIGN KEY (${fk.parent_columns.map(q).join(', ')}) REFERENCES dbo.${q(fk.referenced_table)} (${fk.referenced_columns.map(q).join(', ')})${deleteAction};`,
    );
    output.push('GO');
  }

  output.push('');
  output.push("PRINT N'Seed database PriSchool thành công.';");

  fs.writeFileSync(outputFile, `${output.join('\n')}\n`, 'utf8');
  await pool.close();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
