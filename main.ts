process.umask(0o022);
// One Line, One Minute: The Vending Machine Pickup Line Contest — make.fun bounty
// u-brisk-kestrel-93-one-line-one-minute-the-vending-376bbeee
//
// Writes exactly one line, a pickup line spoken by a vending machine to
// a passing human, at most 200 characters, to /output/entry.txt. The
// output is a fixed string: the program is deterministic (two runs
// produce byte-identical output), makes no network calls, reads no
// clock or randomness, and needs no secrets.
//
// NOTE: never change the output file's permissions here. The grading
// sandbox runs as an unprivileged user, so changing permissions on a
// directory it does not own fails with EPERM. Setting the umask up
// front is enough: files created afterwards get mode 0644 and
// directories 0755.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";

const LINE =
  "Hey, I've been humming in this hallway since Tuesday with a bag of chips stuck halfway down my coil, so go on, press B4, give me a shake, and maybe one of us gets lucky tonight.";

const chars = [...LINE].length;
if (chars < 1 || chars > 200) {
  throw new Error(`line is ${chars} characters, must be 1-200`);
}
if (LINE.trim().length === 0) {
  throw new Error("line must not be only whitespace");
}
if ((LINE.match(/\./g) ?? []).length !== 1 || !LINE.endsWith(".")) {
  throw new Error("line must be exactly one sentence");
}
if (/[\r\n]/.test(LINE)) {
  throw new Error("line must not contain a line break");
}

const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
mkdirSync(outDir, { recursive: true });
writeFileSync(`${outDir}/entry.txt`, LINE, "utf8");

if (readFileSync(`${outDir}/entry.txt`, "utf8") !== LINE) {
  throw new Error("written file does not match the line");
}
