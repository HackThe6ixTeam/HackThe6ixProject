// src/app/api/user/route.js

import nextConnect from 'next-connect';
import multer from 'multer';
import connectToDatabase from '@/lib/mongodb';
import User from '@/lib/models/User';
import pdf from 'pdf-parse';

const upload = multer({ storage: multer.memoryStorage() });
const apiRoute = nextConnect();

apiRoute.use(upload.single('resume'));

apiRoute.post(async (req, res) => {
  try {
    const { email, devpost, github, linkedin } = req.body;

    // Connect to the database
    await connectToDatabase();

    // Parse the PDF file if it exists
    let resumeFileId = null;
    if (req.file) {
      const { buffer } = req.file;
      const data = await pdf(buffer);
      console.log('Extracted Text:', data.text);

      // Store the file in GridFS or handle as needed
      const { GridFSBucket } = mongoose.connection;
      const bucket = new GridFSBucket(mongoose.connection.db, { bucketName: 'uploads' });
      const uploadStream = bucket.openUploadStream(req.file.originalname);
      uploadStream.end(buffer);

      resumeFileId = uploadStream.id;
    }

    // Save user info to MongoDB
    await User.create({
      email,
      devpost,
      github,
      linkedin,
      resumeFileId,
    });

    res.status(201).send({ message: 'Form submitted successfully' });
  } catch (error) {
    console.error('Error handling form submission:', error);
    res.status(500).send({ error: 'Error handling form submission' });
  }
});

export const config = {
  api: {
    bodyParser: false, // Disallow body parsing, consume as stream
  },
};

export default apiRoute;
