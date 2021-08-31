const fs = require('fs');
const fetch = require('node-fetch');
var FormData = require('form-data');
const {promisify} = require('util');
const {pipeline} = require('stream');


const removeBg = async (fileName, writeFile) => {
    const streamPipeline = promisify(pipeline);

    const formData = new FormData();
    formData.append("image_file", fs.createReadStream(fileName));
    const response = await fetch("https://sdk.photoroom.com/v1/segment", {
        method: "POST",
        headers: {
            "x-api-key":
                process.env.PHOTOROOM_API_KEY
        },
        body: formData
    });
    await streamPipeline(response.body, fs.createWriteStream(writeFile));
    return true;
};
exports.createImageWithoutBg = async (id) => {
    // const imageDump = await fs.readFileSync("./uploads/facecrop/" + id + "-1.7");
    // let file = await fetch("./uploads/facecrop/" + id + "-1.7").then(r => r.blob()).
    // console.log(file);
    // if(!imageDump){
    //     return;
    // }
    const finalDump = await removeBg("./uploads/facecrop/" + id + "-1.7","./uploads/withoutBg/" + id + "-1.7");
    // console.log(finalDump);
    // await fs.writeFileSync("./uploads/withoutBg/" + id + "-1.0", finalDump);
    return true;
};



