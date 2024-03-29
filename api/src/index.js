import express from 'express'
import cors from 'cors'
import path from 'path'
import { MongoClient, ObjectId } from 'mongodb'
import { DESTRUCTION } from 'dns';

const app = express();
app.use(cors());
app.use(express.json());


const connectx = await MongoClient.connect('mongodb+srv://devmonk:d3v@cluster.ru31h.mongodb.net');
const dbSessions = await connectx.db('ingressos').collection('sessoes');
const dbSeats = await connectx.db('ingressos').collection('lugares');

function today() {
    let data = new Date();
    let dd = data.getDate();
    let mm = data.getMonth() + 1;
    let yy = data.getFullYear();
    return `${yy}-${mm}-${dd}`
}


function dayNumber(date) {
    date = new Date(`${date}T00:00:00`);
    return date.getDate();
}

function dayOfWeek (date) {
    let t = today();
    if (t === date)
        return 'HOJE'


    date = new Date(`${date}T00:00:00`);
    switch (date.getDay()){
        case 0: return 'Domingo'
        case 1: return 'Segunda'
        case 2: return 'Terça'
        case 3: return 'Quarta'
        case 4: return 'Quinta'
        case 5: return 'Sexta'
        case 6: return 'Sábado'
    }
}

function monthName(date) {
    date = new Date(`${date}T00:00:00`);
    switch (date.getMonth()) {
        case 0: return 'Janeiro'
        case 1: return 'Fevereiro'
        case 2: return 'Março'
        case 3: return 'Abril'
        case 4: return 'Maio'
        case 5: return 'Junho'
        case 6: return 'Julho'
        case 7: return 'Agosto'
        case 8: return 'Setembro'
        case 9: return 'Outubro'
        case 10: return 'Novembro'
        case 11: return 'Dezembro'
    }
}

app.get('/availableDays', async (req,resp) => {

    try {
            let thatDay = today();

        const allDays = await dbSessions.aggregate([
            { $match: { data: { $gt:  thatDay } }},
            { $group: { _id: '$data' } },
            { $project: { _id: 0, data: '$_id'  } },
            { $sort: { data: 1 }},
            { $limit: 6 }
        ]).toArray();

        

        let days = [];
        days = allDays.map(i => {
            return {
                data: i.data,
                mes: monthName(i.data),
                diaSemana: dayOfWeek(i.data),
                dia: dayNumber(i.data)
            }
        })

        resp.send(days);
    } catch(e) {
        resp.send(e.toString());
    }

})

app.get('/availableMovies', async (req,resp) => {
    try {

        let { date } = req.query;
        

        let movies = await dbSessions.find({ data: date }).project({ _id: 0 }).toArray();

        resp.send(movies);


    } catch(e) {
        resp.send(e.toString());
    }
})

app.get('/availableSessions', async (req, resp) => {
    try {

        let { film, date } = req.query;

        let session = await dbSessions.findOne({
            'data': date,
            'filme.nome': film
        });

        resp.send(session.horarios)

    } catch(e) {
        resp.send(e.toString());
    }
})

app.get('/availableSeats', async (req,resp) => {
    try {

        let { date, film, hour, room } = req.query;

        let seats =  await dbSeats.find({
            data: date,
            filme: film,
            hora: hour,
            sala: room
        }).sort( { 'lugar.letra': 1, 'lugar.numero': 1 }).toArray();

        let fileiras = [];
        let objFileira = {};

        for( let seat of seats) {
            if( seat.lugar.letra !== objFileira.fileira ) {
                objFileira = {
                    fileira: seat.lugar.letra,
                    lugares: []
                }
                fileiras.push(objFileira);
            }

            objFileira.lugares.push({
                numero: seat.lugar.numero,
                situacao: seat.lugar.situacao,
                usuario: seat.lugar.usuario
            })
        }

        resp.send(fileiras);

    } catch (e) {
        resp.send(e.toString());
    }
})

app.put('/reserveSeat', async (req,resp) => {
    try {

        let { seat: { date, film, hour, room, letter, number }, user } = req.body;

        let seats = await dbSeats.updateOne({
            data: date,
            filme: film,
            hora: hour,
            sala: room,
            'lugar.letra': letter,
            'lugar.numero': number
        }, {
            '$set': {
                'lugar.situacao': 'Reservado',
                'lugar.usuario': user,
                'lugar.dataReserva': new Date()
            }
        })

        resp.sendStatus(200);

    } catch(e) {

    }
})


app.listen(process.env.PORT, () => console.log('subiu!'))

