// Development = node.js server + React server


const express = require('express');
const cors = require('cors');
const app = express();
const mongoose = require('mongoose');
const User = require('./models/user.model')
const Blog = require('./models/blogmodel')
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const cloudinary = require('cloudinary')
const fileUpload = require('express-fileupload')
const dotenv = require('dotenv')


dotenv.config({
    path: "./config.env"
})

// Add After the Dotenv to Access Environment Vaiables 
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const authConfig = {
    domain: 'dev-hcmfk27hxf2qi26q.us.auth0.com',
    audience: 'http://localhost:1330/api/register',
};


const checkJwt = jwt({
    // Dynamically provide a signing key based on the kid in the header
    secret: jwksRsa.expressJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        jwksUri: `https://${dev - hcmfk27hxf2qi26q.us.auth0.com}/.well-known/jwks.json`,
    }),

    audience: authConfig.audience,
    issuer: `https://${dev - hcmfk27hxf2qi26q.us.auth0.com}/`,
    algorithms: ['RS256'],
});

app.use(checkJwt);

const connectDB = async () => {
    try {
        await mongoose.connect('mongodb://admin:_AbdulKhaliq@ac-m5zx3ns-shard-00-00.i2ian0y.mongodb.net:27017,ac-m5zx3ns-shard-00-01.i2ian0y.mongodb.net:27017,ac-m5zx3ns-shard-00-02.i2ian0y.mongodb.net:27017/Userdata?ssl=true&replicaSet=atlas-7yzf9p-shard-0&authSource=admin&retryWrites=true&w=majority', {
            // useNewUrlParser: true, // This option is not needed anymore
            // useUnifiedTopology: true, // This option is not needed anymore
        });
        console.log("Db Connected");
    } catch (error) {
        console.log(error.message);
    }
}

connectDB();
app.use(fileUpload())

app.use(cors({
    origin: "http://localhost:3000"
}))
app.use(express.json({ limit: '10mb' }));
app.get('/', (req, res) => {
    res.send('dashboard')
})


app.get('/', (req, res) => {
    res.send("home")
})

// app.get('/register', (req, res) => {
//     res.send('register')
// })

// app.post('/api/register', async (req, res) => {
//     const { name, email, password } = req.body;

//     try {
//         // Create user in Auth0
//         const auth0User = await auth0.createUser({
//             email,
//             password,
//             name,
//             connection: 'Username-Password-Authentication',
//         });

//         // Store user in your database with Auth0 user ID
//         const user = await User.create({
//             name,
//             email,
//             password: hashedPassword,
//             auth0Id: auth0User.user_id,
//         });

//         res.json({ status: 'ok', user });
//     } catch (err) {
//         res.json({ status: 'error', error: 'Duplicate email or other validation error', err });
//     }
// });




app.post('/api/register', async (req, res) => {

    const { name, email, password } = req.body

    let user = await User.findOne({ email })

    if (user) {
        return res.json({
            success: false,
            message: "User Already Registered With This Email."
        })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    try {
        let user = await User.create({
            name,
            email,
            password: hashedPassword
        });
        res.json({ status: 'ok', user });


    } catch (err) {
        res.json({ status: 'error', error: 'Duplicate email or other validation error', err });
    }
});





app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User Not Found"
            });
        }

        const isMatched = await bcrypt.compare(password, user.password);



        if (!isMatched) {
            return res.status(401).json({
                success: false,
                message: "Invalid Credentials"
            });
        }

        return res.json({ status: 'ok', message: `${user.name}, Logged In Successfully`, user });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal Server Error"
        });
    }
});


app.get("/blogs/all", async (req, res) => {
    try {
        const blogs = await Blog.find()

        return res.json({
            success: true,
            blogs
        })
    } catch (error) {
        return res.status(200).json({
            success: false,
            message: error.message
        })
    }
}
)


app.get("/blog/:id", async (req, res) => {
    try {

        const blogId = req.params.id;
        const blog = await Blog.findById(blogId);

        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
        }

        return res.json({
            success: true,
            blog,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});

// app.delete('/blog/:id', Authenticate, async (req, res) => {
//     try {
//         const blogId = req.params.id;

//         // Find the blog by ID
//         const blog = await Blog.findById(blogId);

//         // Check if the blog exists
//         if (!blog) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Blog not found',
//             });
//         }

//         // Check if the logged-in user is the author of the blog
//         if (blog.author !== req.user.username) {
//             return res.status(403).json({
//                 success: false,
//                 message: 'You do not have permission to delete this blog',
//             });
//         }

//         // Delete the blog
//         const deletedBlog = await Blog.findByIdAndDelete(blogId);

//         return res.json({
//             success: true,
//             message: 'Blog deleted successfully',
//             deletedBlog,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// });


app.delete("/blog/:id", async (req, res) => {
    try {
        const blogId = req.params.id;
        const deletedBlog = await Blog.findByIdAndDelete(blogId);

        if (!deletedBlog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
        }

        return res.json({
            success: true,
            message: 'Blog deleted successfully',
            deletedBlog,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});



// Assuming you're using Express.js
// app.put("/blog/update/:id", async (req, res) => {
//     try {
//         const blogId = req.params.id;
//         const { title, category, content, author, description, image } = req.body;
//         console.log(blogId)
//         // Assuming you have a Blog model
//         const updatedBlog = await Blog.findByIdAndUpdate(
//             blogId,
//             {
//                 title,
//                 category,
//                 content,
//                 author,
//                 description,
//                 image,
//             },
//             { new: true } // Return the updated document
//         );

//         if (!updatedBlog) {
//             return res.status(404).json({
//                 success: false,
//                 message: 'Blog not found',
//             });
//         }

//         return res.json({
//             success: true,
//             message: 'Blog updated successfully',
//             updatedBlog,
//         });
//     } catch (error) {
//         return res.status(500).json({
//             success: false,
//             message: error.message,
//         });
//     }
// });


app.put('/blog/update/:id', async (req, res) => {
    try {
        const blogId = req.params.id;
        const { title, category, content, description, image } = req.body;

        // Find the blog by ID
        const blog = await Blog.findById(blogId);

        // Check if the blog exists
        if (!blog) {
            return res.status(404).json({
                success: false,
                message: 'Blog not found',
            });
        }

        // // Check if the logged-in user is the author of the blog
        // // if (blog.author !== req.user.username) {
        // //     return res.status(403).json({
        // //         success: false,
        // //         message: 'You do not have permission to update this blog',
        // //     });
        // }

        // Update the blog
        const updatedBlog = await Blog.findByIdAndUpdate(
            blogId,
            {
                title,
                category,
                content,
                description,
                image,
            },
            { new: true } // Return the updated document
        );

        return res.json({
            success: true,
            message: 'Blog updated successfully',
            updatedBlog,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message,
        });
    }
});



app.post("/blog/create", async (req, res) => {
    try {
        const { title, category, content, description } = req.body


        // const userId = req.headers.authorization?.split(' ')[1]; // Assuming the token is in the "Authorization" header

        const userId = req.user?.sub;
        console.log(userId)
        // console.log(userId)
        // console.log(req.body);
        let cloudinaryRes;
        if (req.body.image) {
            cloudinaryRes = await cloudinary.v2.uploader.upload(req.body.image,
                {
                    folder: "Abdul Khaliq Blogs",
                    crop: "scale",
                },
            );
        }


        await Blog.create({
            title, content, category, description,
            author: userId, // Save the Auth0 user ID as the author
            image: {
                public_id: cloudinaryRes.public_id,
                url: cloudinaryRes.secure_url
            }
        })

        return res.status(201).json({
            success: true,
            message: "Blog Created Successfully"
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }

})
app.listen(1330, () => {
    console.log("server started on port 1330")
})