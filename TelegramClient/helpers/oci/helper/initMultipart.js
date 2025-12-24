require('dotenv').config()
const oci = require('../client/ociClient');

module.exports = async function getOciMulipartId(fileName) {
  try {

    const id = await oci.getClient().createMultipartUpload({
      namespaceName:process.env.OCI_NAMESPACE,
      bucketName:process.env.OCI_BUCKETNAME,
      createMultipartUploadDetails: {
        object: fileName
      }
    });
    return id.multipartUpload.uploadId;
  } catch (error) {
    console.log("error during id creation",error)
  }
}
