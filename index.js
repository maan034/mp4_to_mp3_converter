const express=require('express')
const app =express()
const { exec } = require('child_process')

const multer =require('multer')

const fs=require('fs')

const path=require('path')

const bodyParser = require('body-parser')
app.use(express.static('public'))
var dir ='public'
var subDirectory='public/uploads'

if(!fs.existsSync(dir))
{
    fs.mkdirSync(dir)

    fs.mkdirSync(subDirectory)
}

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
      cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

var upload = multer({storage:storage})

app.use(bodyParser.urlencoded({extended:false}))
app.use(bodyParser.json())
app.use(express.static('public'))


const PORT =process.env.PORT ||5000
app.get('/',(req,res)=>{
    res.sendFile(__dirname+"/index.html")
})

app.post('/convert',upload.single('file'),(req,res,next) => {
    if(req.file){
        console.log(req.file.path)

        var output = Date.now() + "output.mp3"

        exec(`ffmpeg -i ${req.file.path} ${output}`, (error, stdout, stderr) => {
            if (error) {
                console.log(`error: ${error.message}`);
                return;
            }
            else{
                console.log("file is converted")
            res.download(output,(err) => {
                if(err) throw err
                
                /* below  these 2 lines automatically delete
                the upload and converted file also */
                fs.unlinkSync(req.file.path)
                fs.unlinkSync(output)

                next()

            })
        }
        })
    }
})
app.listen(PORT,()=>{
    console.log(`App is listening on ${PORT}`)
})