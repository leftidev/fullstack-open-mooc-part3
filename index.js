require('dotenv').config()
const express = require('express')
const app = express()
const morgan = require('morgan');
const cors = require('cors')
const Person = require('./models/person')

app.use(cors())
app.use(express.static('dist'))
app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body));
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'));

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.get('/', (request, response) => {
    response.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (request, response, next) => {
    Person.find({}).then(persons => {
      response.json(persons)
    })
    .catch(error => next(error));
})

app.get('/info', (request, response) => {
  Person.find({}).then(persons => {
    const numberOfPersons = persons.length;
    const currentDate = new Date();
    const responseText = `Phonebook has info for ${numberOfPersons} people<br/><br/>${currentDate}`;
    response.send(responseText);
  }).catch(error => {
    next(error); // status 500 failed to fetch persons
  });
});

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id)
    .then(person => {
      if (person) {
        response.json(person)
      } else {
        response.status(404).end()
      }
    })

    .catch(error => next(error))
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const body = request.body

  /*
  if (!body.name || body.name.trim() === '') {
    const error = new Error('name missing');
    error.status = 400;
    return next(error);
  }

  if (!body.number || body.number.trim() === '') {
    const error = new Error('number missing');
    error.status = 400;
    return next(error);
  }
  */
  //const nameExists = persons.some(person => person.name === body.name);
  //if (nameExists) {
  //  return response.status(400).json({ error: 'name must be unique' });
  //}
  
  const person = new Person({
      name: body.name,
      number: body.number,
    })
  
    person.save().then(savedPerson => {
      response.json(savedPerson)
    })
    .catch(error => next(error));
})

app.put('/api/persons/:id', (request, response, next) => {
  const body = request.body

  const person = {
      name: body.name,
      number: body.number,
    }

  Person.findByIdAndUpdate(
    request.params.id, 

    person,
    { new: true, runValidators: true, context: 'query' }
  )
    .then(updatedPerson => {
      response.json(updatedPerson )
    })
    .catch(error => next(error))
})

// handler of requests with unknown endpoint
app.use(unknownEndpoint)

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).send({ error: 'malformatted id' })
  } 

  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: error.message });
  }

  if (error.status) {
    return response.status(error.status).json({ error: error.message });
  }

  next(error)
}

// this has to be the last loaded middleware, also all the routes should be registered before this!
app.use(errorHandler)

const PORT = process.env.PORT
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on http://0.0.0.0:${PORT}`);
  });