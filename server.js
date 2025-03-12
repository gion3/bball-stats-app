import express from 'express';
import bcrypt from 'bcrypt';
import cors from 'cors';
const app = express()

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cors())

const users = []

app.get('/users',(req,res) => {
    res.json(users)
})

app.post('/users',  async (req,res) => {
    try{
        const salt = await bcrypt.genSalt()
        const hashedPw = await bcrypt.hash(req.body.password, salt)
        // console.log(salt)
        // console.log(hashedPw)
        const user = {name: req.body.username, password: hashedPw}
        console.log(user)
        users.push(user)
        res.status(201).send()
    }
    catch{
        res.status(500).send()
    }
})

app.post('/users/login', async (req,res) => {
    const user = users.find(user => user.name = req.body.name)
    if(user == null){
        return res.status(400).send('Cannot find user')
    }
    try{
        if(await bcrypt.compare(req.body.password, user.password)){
            res.send('Success')
        }
        else{
            res.send('Not Allowed')
        }
    }
    catch{
        res.status(500).send()
    }
})

app.listen(3000, () => {
    console.log('Server pornit pe port 3000')
})
