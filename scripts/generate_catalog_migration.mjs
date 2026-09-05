import fs from "node:fs/promises";

const [
  catalogPath,
  metadataPath,
  outputPath,
  revisionArg = "1",
  changeNote = "Initial catalog assembled from the portal export, faculty PDF, and curated workbook.",
] = process.argv.slice(2);
if (!catalogPath || !metadataPath || !outputPath) {
  throw new Error("Usage: generate_catalog_migration.mjs <catalog.json> <metadata.json> <output.sql> [revision] [change-note]");
}

const revision = Number(revisionArg);
if (!Number.isSafeInteger(revision) || revision < 1) {
  throw new Error(`Invalid revision: ${revisionArg}`);
}

const catalog = JSON.parse(await fs.readFile(catalogPath, "utf8"));
const metadata = JSON.parse(await fs.readFile(metadataPath, "utf8"));
if (!Array.isArray(catalog) || !metadata.semesterId || !metadata.semesterLabel) {
  throw new Error("Invalid catalog or metadata");
}

const sqlString = value => `'${String(value).replaceAll("'", "''")}'`;
const sourceSummary = JSON.stringify({
  importedAt: metadata.importedAt,
  courseCount: metadata.courseCount,
  sectionCount: metadata.sectionCount,
  sessionCount: metadata.sessionCount,
  sources: metadata.sources,
  mergeStats: metadata.mergeStats,
});

const courseStatements = catalog.map(course =>
  `UPDATE course_data\n` +
  `SET parsed_json = json_insert(parsed_json, '$[#]', json(${sqlString(JSON.stringify(course))}))\n` +
  `WHERE semester_id = ${sqlString(metadata.semesterId)} AND revision = ${revision};\n`
).join("\n");

const sql = `-- Generated from ${catalogPath}; do not hand-edit the JSON payload.\n` +
`-- Courses are appended one statement at a time to stay below D1's statement-size limit.\n` +
`INSERT INTO course_data\n` +
`  (semester_id, semester_label, revision, raw_text, parsed_json, source_summary, change_note, updated_at)\n` +
`VALUES (\n` +
`  ${sqlString(metadata.semesterId)},\n` +
`  ${sqlString(metadata.semesterLabel)},\n` +
`  ${revision},\n` +
`  ${sqlString(`Imported from ${metadata.sources.map(source => source.name).join(", ")}`)},\n` +
`  '[]',\n` +
`  ${sqlString(sourceSummary)},\n` +
`  ${sqlString(changeNote)},\n` +
`  unixepoch()\n` +
`);\n\n` +
`${courseStatements}\n` +
`INSERT INTO semester_settings (id, active_semester_id, updated_at)\n` +
`VALUES (1, ${sqlString(metadata.semesterId)}, unixepoch())\n` +
`ON CONFLICT(id) DO UPDATE SET\n` +
`  active_semester_id = excluded.active_semester_id,\n` +
`  updated_at = excluded.updated_at;\n`;

await fs.writeFile(outputPath, sql, "utf8");
console.log(JSON.stringify({ outputPath, bytes: Buffer.byteLength(sql), courses: catalog.length }));
