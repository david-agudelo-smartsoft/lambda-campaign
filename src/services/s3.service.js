import AWS from "aws-sdk";



export class S3Uploader {
  constructor() {
    AWS.config.update({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    this.s3 = new AWS.S3();
  }

  async uploadFile(file) {
    try {
        const s3Response = await this.s3
        .upload({
          Bucket: process.env.AWS_BUCKET_NAME,
          
          Key: `/test/${file.originalname}`,
          Body: file.buffer,
          ContentType: file.mimetype
        })
        .promise();

      return{...s3Response};
    } catch (error) {
      console.log(error)
    }
  }
}

export default new S3Uploader();