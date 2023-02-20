const mongoose = require('mongoose')

let action = 0

if (process.argv.length === 5) {
    console.log(`Add/update phone book entry ${process.argv[3]} ${process.argv[4]}`)
    action = 1
} else if (process.argv.length == 3) {
    console.log(`Show existing phone book entries`)
    action = 2
} else {
    console.log("Usage:\n",
        "node mongo.js $PASSWORD 'Ann Ye' 12345  # Add/update phone book entry\n",
        "node mongo.js $PASSWORD  # Show existing phone book entries",
    )
    process.exit(-1)
}

const password = process.argv[2]
const url = `mongodb+srv://lizechuan1206:${password}@lawr-cluster-0.oau8y9r.mongodb.net/phonebookApp?retryWrites=true&w=majority`

mongoose.set('strictQuery', false)
mongoose.connect(url)

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
})

const Person = mongoose.model('Person', personSchema)

if (action === 1) {
    const person = new Person({
        id: Math.floor(Math.random() * 1e6),
        name: process.argv[3],
        number: process.argv[4]
    })

    person.save().then(result => {
        console.log('person saved!')
        mongoose.connection.close()
    })
} else if (action === 2) {

    Person.find({}).then(result => {
        result.forEach(p => {
            console.log(p)
        })
        mongoose.connection.close()
    })
} else {
    console.log(`Error: unexpected action ${action}`)
}
