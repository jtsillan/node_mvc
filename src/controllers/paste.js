import Paste from "../models/paste.js";
import hljs from 'highlight.js'
import { escape } from "html-escaper";

// Hakee kaikki Pastet kun endpoint on "/"
const getAllPastes = async(req, res, next) => {
    try {
        const pasteItems = await Paste.find({});
        if (!pasteItems) return res.status(404).send();

        // Näyttää Paste itemit 'pasteViewAll.ejs' mukaisesti
        res.render('paste/pasteViewAll', { pasteItems })
   
    } catch (e) {

         // Ohjelman kaatuessa lähetetään error middlewaren käsiteltäväksi 
        next(e);
    }
}

// Hakee yksittäisen Pasten id:n perusteella, endpoint "paste/:id"
const getPaste = async(req, res, next) => {

    // Jos pyynnössä ei vastaa palautetaan 'bad request' ilmoitus
    if (!req.params.id) return res.status(400).send();     
               
    
    try { // Tarkistetaan löytyykö Paste id:n perusteella tietokannasta
        const paste = await Paste.findById(req.params.id);

        // Jos Pastea ei löydy, palautetaan 'Not Found' ilmoitus
        if (!paste) return res.status(404).send();       
        
        // Näyttää oikean Pasten 'paste/:id' endpointissa
        res.render('paste/pasteViewSingle', paste)

    } catch (e) {

        // Ohjelman kaatuessa lähetetään error middlewaren käsiteltäväksi
        next(e);
    }
}

// Renderöi lomakkeen uuden pasten tietokantaan luomiselle
const getCreateNewPaste = (req, res, next) => {
    res.render('paste/pasteViewCreate')
}

// Uuden pasten luominen, ottaa vastaan POST requestin
const postCreateNewPaste = async(req, res, next) => {

    try {
        // Ottaa vastaan POST requestin bodyssä seuraavat tiedot:
        // title, description, body
        const { title, description, body } = req.body

        // Tarkistetaan ettei mikään vaadituista tiedoista ole tyhjä,
        // jos on niin lähetetään error viesti middlewaren käsiteltäväksi
        if (!title || !description || !body) return next('Kaikki kentät tulee täyttää')

        // Luodaan uusi Paste instanssi Paste modelin perusteella
        const paste = new Paste({
            // Poistetaan XSS haavoittuvuus
            title: escape(title),
            description: escape(description),
            // Lisätään highlight.js:n muutokset body datalle eli koodipastelle.
            // highlightAuto metodi yrittää tunnistaa koodin ja laittaa värit sen perusteella.
            // Käsittely hoitaa samalla string escapen body -datalle, mites muut datat?
            body: hljs.highlightAuto(body).value
        });

        // Tallennetaan Paste instanssin data tietokantaan
        const data = await paste.save();

        // Jos tietokanta ei anna vastausta niin toiminto on epäonnistunut
        // ja lähetetään error status 500 - internal server error
        if (!data) return res.status(500).send()

        // Uusi data luotu onnistuneesti
        // Luodaan pasteViewSingle html sivu ja palautetaan se selaimelle luodun paste datan kanssa
        res.render('paste/pasteViewSingle', paste)

    } catch (e) {
        // Jos ohjelma kaatuu niin lähetetään error middlewaren käsiteltäväksi
        next(e)
    }
}

// Poistaa valitun Pasten id:n perusteella
const deletePaste = async(req, res, next) => {

    // 
    if (!req.params.id) return res.status(400).send();
    try {
        const paste = await Paste.findById(req.params.id);
        if (!paste) return res.status(404).send();
        await paste.delete();

        next("Poisto onnistui")

    } catch (e) {
        next(e);
    }
}

// Tuodaan muuttujat routerille
export default {
    getPaste,
    getAllPastes,
    getCreateNewPaste,
    postCreateNewPaste,
    deletePaste
}