const imageKit = require('imagekit')

const image = new imageKit({
    publicKey: "public_dHBaXq/4PX27obh+I5gxUWLDoCE=",
    privateKey: "private_a25wwYtPOGwcFfe6ah0DN8Y6GxY=",
    urlEndpoint: "https://ik.imagekit.io/sabianathallah"
})

module.exports = image