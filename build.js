import child_process from "child_process"
import fs from "fs"

function run(command) {
    console.log("command: " + command)
    const result = child_process.execSync(command)
    console.log(result.toString())
}

function writeFile(filePath, content) {
    console.log("command: " + `write to file ${filePath}`)
    fs.writeFileSync(filePath, content)
}

function appendFile(filePath, content) {
    console.log("command: " + `append to file ${filePath}`)
    fs.appendFileSync(filePath, content)
}

function mkdir(dir) {
    console.log("command: " + `make dir ${dir}`)
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, {recursive: true})
    }
}

function rm(path) {
    console.log("command: " + `remove ${path}`)
    if (fs.existsSync(path)) {
        fs.rmSync(path, {recursive: true, force: true})
    }
}

function build() {
    run("npx -y bun install")
    run("ng build")
}

build()
