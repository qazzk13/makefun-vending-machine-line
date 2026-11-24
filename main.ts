process.umask(0o022);
// One Line, One Minute: The Vending Machine Pickup Line Contest — make.fun bounty
// u-brisk-kestrel-93-one-line-one-minute-the-vending-376bbeee
//
// What this program does, in plain terms:
//   Writes exactly one line — a pickup line spoken by a vending machine
//   to a passing human — to /output/entry.txt, at most 200 characters.
//   The line is a fixed string baked into the source below, so the
//   program is deterministic: two runs produce byte-identical output,
//   it makes no network calls, reads no clock, uses no randomness,
//   and needs no secrets or configuration beyond the output directory.
//
// Why the line reads the way it does is explained in README.md. In
// short: the machine leans on the one compliment it can honestly pay
// about itself (it literally stays cool, and everything inside it is
// ice-cold) and on the one promise a hallway machine can actually
// keep, which is not judging anybody's late-night craving.
//
// NOTE: never change the output file's permissions here. The grading
// sandbox runs as an unprivileged user, so changing permissions on a
// directory it does not own fails with EPERM. Setting the umask up
// front is enough: files created afterwards get mode 0644 and
// directories 0755.
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

// The entry itself. One sentence only, and deliberately no full stops
// hiding inside abbreviations (so no "a.m." style spellings — "2am" is
// written without dots on purpose), because the validator below counts
// full stops to prove this really is a single sentence.
const LINE =
  "Psst, I stay cool all night, my cans are ice-cold, and I never judge a 2am craving, so feed me a coin, punch in C7, and let's make this empty hallway feel a little less lonely.";

// Validate the line against every rule the contest states, before any
// file is touched. Keeping all the checks in one small function makes
// the rules easy to audit at a glance, and each failure names the rule
// it broke rather than failing with a bare, unhelpful message.
const MAX_CHARS = 200;

function validateLine(line: string): void {
  // Count code points, not UTF-16 code units, so an accented letter or
  // an emoji would count the way a reader counts it.
  const chars = [...line].length;
  if (chars < 1 || chars > MAX_CHARS) {
    throw new Error(`line is ${chars} characters, must be 1-${MAX_CHARS}`);
  }
  if (line.trim().length === 0) {
    throw new Error("line must not be only whitespace");
  }
  if (line !== line.trim()) {
    throw new Error("line must not have leading or trailing whitespace");
  }
  if (/[\r\n]/.test(line)) {
    throw new Error("line must not contain a line break");
  }
  // Exactly one sentence: one full stop in total, and it ends the line.
  const fullStops = (line.match(/\./g) ?? []).length;
  if (fullStops !== 1 || !line.endsWith(".")) {
    throw new Error("line must be exactly one sentence ending in a full stop");
  }
}

validateLine(LINE);

// Write the line, then read it straight back and compare. The read-back
// is the cheapest honest check there is: if the bytes on disk are not
// exactly the line we validated, something went wrong on the way there
// and the run should fail loudly instead of submitting a surprise.
function main(): void {
  const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
  const outFile = join(outDir, "entry.txt");

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, LINE, "utf8");

  const written = readFileSync(outFile, "utf8");
  if (written !== LINE) {
    throw new Error(
      `written file does not match the line (wrote ${[...LINE].length} characters, read back ${[...written].length})`,
    );
  }
}

try {
  main();
} catch (err) {
  // Surface a single readable line on stderr and exit non-zero, so a
  // failed run is obvious in logs instead of looking like success.
  console.error(`makefun-vending-machine-line: ${err instanceof Error ? err.message : String(err)}`);
  process.exitCode = 1;
}
