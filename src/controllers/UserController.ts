import { Request, Response } from "express";
import {
  S3Client,
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import crypto from "crypto";
import User from "../models/User";
import dotenv from "dotenv";
dotenv.config();

const bucketName = process.env.BUCKET_NAME;
const bucketRegion = process.env.BUCKET_REGION;
const accessKeyId = process.env.ACCESS_KEY;
const secretAccessKey = process.env.SECRET_ACCESS_KEY;

const s3 = new S3Client({
  credentials: {
    secretAccessKey: secretAccessKey as string,
    accessKeyId: accessKeyId as string,
  },
  region: bucketRegion,
});

export default {
  async view(req: Request, res: Response) {
    try {
      const getUserData = await User.find();

      if (getUserData.length) {
        const { name, profileImageName, validUntil } = getUserData[0];

        const getObjectParams = {
          Bucket: bucketName,
          Key: profileImageName,
        };

        const command = new GetObjectCommand(getObjectParams);
        const profileImageUrl = await getSignedUrl(s3, command, {
          expiresIn: 604800,
        }); //expires in a week

        return res
          .status(200)
          .json({ user: { name, profileImage: profileImageUrl, validUntil } });
      } else return res.status(200).json({ user: null });
    } catch (err) {
      res.status(400).json({ message: err });
      console.log(err);
    }
  },
  async edit(req: Request, res: Response) {
    try {
      if (!req.file || !req.body.name || !req.body.validUntil)
        return res.status(400).json({ message: "Invalid request!" });

      const randomImageName = crypto.randomBytes(32).toString("hex");

      const putObjectParams = {
        Bucket: bucketName,
        Key: randomImageName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
      };

      const user = await User.find();

      if (!user.length) {
        await User.create({
          name: req.body.name,
          validUntil: req.body.validUntil,
          profileImageName: randomImageName,
        });
      } else {
        //deleting old image from bucket before saving the new one
        const deleteObjectParams = {
          Bucket: bucketName,
          Key: user[0].profileImageName,
        };
        
        const command = new DeleteObjectCommand(deleteObjectParams);
        await s3.send(command);

        await User.findOneAndUpdate(
          { _id: user[0]._id },
          {
            name: req.body.name,
            validUntil: req.body.validUntil,
            profileImageName: randomImageName,
          }
        );
      }

      const command = new PutObjectCommand(putObjectParams);
      await s3.send(command);

      res.status(200).json({ message: "Saved sucessfuly!" });
    } catch (err) {
      console.log(err);
      res.status(400).json({ message: err });
    }
  },
};
