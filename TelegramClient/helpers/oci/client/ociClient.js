const common = require('oci-common');
const objectStorage = require('oci-objectstorage');

const client = {
    ociClient: null
};

module.exports.Connect = () => {

    try {
        const provider = new common.ConfigFileAuthenticationDetailsProvider();
        const ociClient = new objectStorage.ObjectStorageClient({
            authenticationDetailsProvider: provider,
        });
        client.ociClient = ociClient;
    } catch (error) {
        console.log(error)
    }
}



module.exports.getClient = () => {
    return client.ociClient;
};