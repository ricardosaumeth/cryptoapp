const avroTs = require("@ovotech/avro-ts")
const fs = require("fs")
const path = require("path")

const inputDir = path.join(__dirname, "..")
const outputDir = path.join(__dirname, "../../src/types/avro")
const indexFile = path.join(__dirname, "../../src/types/avro-types.ts")

// Ensure output directory exists
fs.mkdirSync(outputDir, { recursive: true })

const schemas = fs
  .readdirSync(inputDir)
  .filter((file) => file.endsWith(".avsc"))
  .map((file) => path.join(inputDir, file))

let indexExports = "// Auto-generated exports from Avro schemas\n\n"
const exportedNames = new Set()

for (const schemaPath of schemas) {
  const fileName = path.basename(schemaPath, ".avsc")
  const outputFile = path.join(outputDir, `${fileName}.ts`)
  const schemaContent = fs.readFileSync(schemaPath, "utf8")

  let fileOutput = "// Auto-generated TypeScript types from Avro schema\n\n"
  let enums = ""
  const processedEnums = new Set()

  // Handle multiple schemas in one file
  const jsonObjects = schemaContent
    .trim()
    .split("\n\n")
    .filter((s) => s.trim())

  for (const jsonStr of jsonObjects) {
    try {
      const schema = JSON.parse(jsonStr)

      // Generate enum for Avro enum types with unique names
      if (schema.type === "enum" && !processedEnums.has(schema.name)) {
        const enumName = `${schema.name}Enum`
        enums += `export enum ${enumName} {\n`
        schema.symbols.forEach((symbol) => {
          enums += `  ${symbol} = "${symbol.toLowerCase()}",\n`
        })
        enums += "}\n\n"
        processedEnums.add(schema.name)

        // Add to index exports only if not already exported
        if (!exportedNames.has(enumName)) {
          indexExports += `export { ${enumName} } from "./avro/${fileName}";\n`
          exportedNames.add(enumName)
        }
      }

      const ts = avroTs.toTypeScript(schema)
      fileOutput += ts + "\n"

      // Add type exports to index only if not already exported
      if (schema.type === "record" && !exportedNames.has(schema.name)) {
        indexExports += `export type { ${schema.name} } from "./avro/${fileName}";\n`
        exportedNames.add(schema.name)
      } else if (schema.type === "enum" && !exportedNames.has(schema.name)) {
        indexExports += `export type { ${schema.name} } from "./avro/${fileName}";\n`
        exportedNames.add(schema.name)
      }
    } catch (error) {
      console.warn(`Skipping invalid JSON in ${schemaPath}:`, error.message)
    }
  }

  // Write individual file
  fs.writeFileSync(outputFile, enums + fileOutput)
  console.log(`✔ Generated ${fileName}.ts`)
}

// Write index file
fs.writeFileSync(indexFile, indexExports)
console.log("✔ Generated index file with all exports")
