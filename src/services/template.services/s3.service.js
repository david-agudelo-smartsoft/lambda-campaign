import AWS from "aws-sdk";



export class S3Uploader {
  constructor() {
    AWS.config.update({
      accessKeyId: process.env.BOT_ACCESS_KEY_ID,
      secretAccessKey: process.env.BOT_SECRET_ACCESS_KEY,
      region: process.env.BOT_REGION,
    });

    this.s3 = new AWS.S3();
  }

  async uploadFile(file,appname) {
    try {
        const s3Response = await this.s3
        .upload({
          Bucket: process.env.BOT_BUCKET_NAME,
          Key: `templates-image/${appname}/${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype,
          Metadata: {
            firma: process.env.SECRET_KEY
         }
        })
        .promise();

      return{...s3Response};
    } catch (error) {
      console.log(error)
    }
  }
}

export default new S3Uploader();