const fs = require("fs");
const lockfile = require("proper-lockfile");

// appends a line into a file
async function append(line, path) {
  try {
    // check if file exists. if it cant be opened. then create the file.
    fs.closeSync(fs.openSync(path, "a"));
    // lock the file, for append operation
    const release = await lockfile.lock(path);
    // 'a' flag stands for 'append'
    const log = fs.createWriteStream(path, { flags: "a" });

    // write line
    log.write(`${line} \n`);

    // end writing
    log.end();

    // release the file
    await release();
  } catch (e) {
    // either lock could not be acquired
    // or releasing it failed
    console.error(e);
    throw e;
  }

  return;
}

module.exports = {
  append
};
