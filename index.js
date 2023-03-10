const cors = require('cors')
require('dotenv').config()
const express = require('express')
const morgan = require('morgan')

const app = express()

const Person = require('./models/person')

morgan.token('body', req => JSON.stringify(req.body))

const requestLogger = (request, response, next) => {
  console.log('Method:', request.method)
  console.log('Path:  ', request.path)
  console.log('Body:  ', request.body)
  console.log('---')
  next()
}

const errorHandler = (error, request, response, next) => {
  console.error(error.message)

  if (error.name === 'CastError') {
    return response.status(400).json({ error: 'malformatted id' })
  }
  if (error.name === 'ValidationError') {
    return response.status(400).json({ error: `invalid input params: ${error.message}` })
  }

  console.log('Unresolved error', error)

  next(error)
}

const unknownEndpoint = (request, response) => {
  response.status(404).send({ error: 'unknown endpoint' })
}

app.use(cors())
app.use(express.json())
app.use(morgan(':method :url :status :res[content-length] - :response-time ms :body'))
app.use(requestLogger)
app.use(express.static('build'))

app.get('/api/persons/:id', (request, response, next) => {
  Person.findById(request.params.id).then(result => {
    if (result) {
      response.json(result)
    } else {
      response.status(404).json({ error: `Person id=${request.params.id} does not exist` })
    }
  }).catch(error => next(error))
})

app.get('/api/persons', (request, response) => {
  Person.find({}).then(result => response.json(result))
})

app.get('/info', (request, response) => {
  Person.find({}).then(result => {
    response.send(`<div>Phonebook has info for ${result.length} people</div><div>${Date()}</div>`)
  })
})

app.delete('/api/persons/:id', (request, response, next) => {
  Person.findByIdAndRemove(request.params.id)
    .then(() => { response.status(204).end() })
    .catch(error => next(error))
})

app.post('/api/persons', (request, response, next) => {
  const { body } = request
  Person.find({ name: body.name }).then(result => {
    if (result.length !== 0) {
      response.status(400).json({ error: `Person ${body.name} already exists` })
    } else {
      const person = new Person({
        name: body.name,
        number: body.number,
      })
      person.save().then(savedPerson => response.json(savedPerson)).catch(error => next(error))
    }
  })
})

app.put('/api/persons/:id', (request, response, next) => {
  const { body } = request
  const person = {
    name: body.name,
    number: body.number,
  }

  Person.findByIdAndUpdate(request.params.id, person, { new: true, runValidators: true })
    .then(updatedPerson => {
      response.json(updatedPerson)
    })
    .catch(error => next(error))
})

app.use(unknownEndpoint)
app.use(errorHandler)

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
