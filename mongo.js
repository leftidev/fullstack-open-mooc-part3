const mongoose = require('mongoose')

if (process.argv.length<3) {
  console.log('give arguments: <password>')
  process.exit(1)
}

//const password = process.argv[2]

//const url =
//    `mongodb+srv://fullstack-phonebook:${password}@fullstack.169wb.mongodb.net/phonebook?retryWrites=true&w=majority&appName=fullstack`
const url = process.env.MONGODB_URI

mongoose.set('strictQuery',false)

mongoose.connect(url)

const personSchema = new mongoose.Schema({
  id: String,
  name: String,
  number: String,
})

const Person = mongoose.model('Person', personSchema)

if (process.argv.length === 3) {
  Person.find({}).then(result => {
    console.log('phonebook:')
    result.forEach(person => {
      console.log(`${person.name} ${person.number}`)
    })
    mongoose.connection.close()
  })
} else if (process.argv.length === 5) {
  const name = process.argv[3]
  const number = process.argv[4]

  const person = new Person({
    id: Math.floor(Math.random() * 1000),
    name: name,
    number: number,
  })

  person.save().then(() => {
    console.log(`added ${name} number ${number} to phonebook`)
    mongoose.connection.close()
  })
} else {
  console.log('Please provide the name and number as arguments: node mongo.js <password> <name> <number>')
  mongoose.connection.close()
}