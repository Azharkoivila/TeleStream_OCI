require('dotenv').config();
const fs = require('fs');
const getOciMulipartId = require('../oci/helper/initMultipart');
const oci = require('../oci/client/ociClient');
const ociCommitPart= require('../oci/helper/commitMultipart');
const genaratePAR = require('../oci/helper/genaratePAR');

module.exports = async function StreemData(client, target, fileName, job, { user_id }) {
  try {
    // buffer downlod for samall files
    // const buffer = await client.downloadMedia(event.message.media||event.message.file, {
    //         workers: 1,
    //     });

    // FetchMultipart OCI ID
    const uploadId = await getOciMulipartId(fileName);
    const parts = [];
    let partNum = 1;
    console.log("ooooh... Igot Multipart Commit id :", uploadId)
    await job.updateProgress({ user_id, progress: 'Upload Started' });
    for await (const chunk of client.iterDownload({
      file: target,
      requestSize: 1 * 1024 * 1024,
    })) {
      // fs.appendFileSync(`img${Date.now()}.jpeg`, chunk);    if you want write directly todisk 
      // iterfetch and upload
      const res = await oci.getClient().uploadPart({
        namespaceName: process.env.OCI_NAMESPACE,
        bucketName: process.env.OCI_BUCKETNAME,
        objectName: fileName,
        uploadId,
        uploadPartNum: partNum,
        uploadPartBody: chunk
      });
      parts.push({ partNum, etag: res.eTag });
      console.log("uploaded :", partNum);
      partNum++;
    }
    //commiting all parts
    await ociCommitPart(fileName, uploadId, parts);

    await job.updateProgress({ user_id, progress: 'Upload Compleate And Genarating Link' });
    // genarate PAR
    const par = await genaratePAR(fileName);
    return `${process.env.OCI_BASE_PAR_URL}${par.preauthenticatedRequest.accessUri}`;
  } catch (error) {
    console.log("error in file streem", error)
  }
}