import City from '#models/city';
import Country from '#models/country';
import State from '#models/state';
import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { readFile } from 'fs/promises'

export default class extends BaseSeeder {

    async run() {
        console.log('Seeding cities, estates and countries...')
        let i = 0
        try {
        const fileContent = await readFile('./database/json/countries.json', 'utf-8')
        const countries = JSON.parse(fileContent)

        for (const country of countries) {
            country.latitude = parseFloat(country.latitude)
            country.longitude = parseFloat(country.longitude)
            country.timezones = JSON.stringify(country.timezones)
            country.translations = JSON.stringify(country.translations)

            const model = await Country.create(country)
            if (!model) {
                console.error('Error al crear el país:', country.name);
            }
            i++
        }
            console.log(`Se insertaron ${i} países`)
        } catch (error) {
            console.error('Error al leer el archivo countries.json:', error)
        }

        try {
        i = 0
        const fileContent = await readFile('./database/json/states.json', 'utf-8')
        const states = JSON.parse(fileContent)
        for (const state of states) {
            state.latitude = parseFloat(state.latitude)
            state.longitude = parseFloat(state.longitude)
            const model = await State.create(state)
            if (!model) {
                console.error('Error al crear el estado:[', state.id, '] ', state.name);
            }
            i++
        }
        console.log(`Se insertaron ${i} estados`)
        }
        catch (error) {
            console.error('Error al leer el archivo states.json:', error)
        }

        try {
        const fileContent = await readFile('./database/json/cities.json', 'utf-8')
        const cities = JSON.parse(fileContent)
        i = 0
        for (const city of cities) {
            city.latitude = parseFloat(city.latitude)
            city.longitude = parseFloat(city.longitude)
            const model = await City.create(city)
            if (!model) {
                console.error('Error al crear la ciudad:[', city.id, '] ', city.name);
            }
            // else{
            //     console.log(i, ' [', city.id, '] ', city.name);
            // }
            i++
            if (i % 4321 === 0) {
            console.log(`Se insertaron ${i} ciudades`)
            }
            if (city.id === 131508) {
                console.log(`finalizado: ${i} ciudades creadas`)
                return
            }
        }
        console.log(`Se insertaron ${i} ciudades en total`)
        return
        } catch (error) {
            console.error('Error al leer el archivo cities.json:', error)
        }
    }
}
