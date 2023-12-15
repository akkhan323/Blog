const mongoose = require("mongoose");


const blogSchema = new mongoose.Schema({
    title: String,
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "UserData"
    },
    description: String,
    category: {
        type: String,
    },
    content: String,
    createdAt: {
        type: Date,
        default: Date.now
    },
    image: {
        public_id: {
            type: String,
        },
        url: {
            type: String,
            // required: true
        }
    }
})


const Blog = mongoose.model("blog", blogSchema)


module.exports = Blog