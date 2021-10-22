"use strict";

import Reader from "../Source/Extensions/client";
import express from "express";
import MemoryStore from "memorystore";
import session from "express-session";
import { parse, URL } from "url";
import path from "path";
import passport from "passport";
import { Strategy } from "passport-discord";
import Logger from "../Source/Extensions/logger";
import bodyParser from "body-parser";
import ejs from "ejs";
import config from "../Source/Interfaces/config.json";

const app = express();
const memoryStore = MemoryStore(session);

interface DomainOptions {
    host: string;
    protocol: string;
}

export const Dashboard = async (client: Reader) => {
    const dataDir = path.resolve(`${process.cwd()}${path.sep}dashboard`);
    const templateDir = path.resolve(`${dataDir}${path.sep}views`);

    passport.serializeUser((user, done) => done(null, user));
    passport.deserializeUser((obj, done) => done(null, obj));

    let callbackURL: string;
    let domain: DomainOptions;

    try {
        const domainURL = new URL(config.DOMAIN);
        domain = {
            host: domainURL.hostname,
            protocol: domainURL.protocol
        };
    } catch (err) {
        Logger.error("DASHBORD ERROR", err);
    }

    callbackURL = `${domain.protocol}//${domain.host}:${config.PORT}/callback`;

    passport.use(new Strategy({
        clientID: config.CLIENT_ID,
        clientSecret: config.CLIENT_SECRET,
        callbackURL: callbackURL,
        scope: ["identify", "guilds"]
    }, (acessTokem ,refreshToken, profile, done) => {
        process.nextTick(() => done(null, profile));
    }));

    app.use(session({
        store: new memoryStore({ checkPeriod: 86400000 }),
        secret: "#@%#&^$^$%@$^$&%#$%@#$%$^%&$%^#$%@#$%#E%#%@$FEErfgr3g#%GT%536c53cc6%5%tv%4y4hrgrggrgrgf4n",
        resave: false,
        saveUninitialized: false,
    }));

    app.use(passport.initialize());
    app.use(passport.session());

    app.locals.domain = config.DOMAIN.split("//")[1];

    app.engine("ejs", ejs.renderFile);
    app.set("view engine", "ejs");

    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({
        extended: true
    }));

    app.use("/", express.static(path.resolve(`${dataDir}${path.sep}assets`)));

    const renderTemplate = (res, req, template, data = {}) => {
        const baseData = {
            bot: client,
            config: config,
            path: req.path,
            user: req.isAuthenticated() ? req.user : null
        };
    
        res.render(path.resolve(`${templateDir}${path.sep}${template}`), Object.assign(baseData, data));
    };

    const checkAuth = (req, res, next) => {
        if (req.isAuthenticated()) return next();
        req.session.backURL = req.url;
        res.redirect("/login");
    }

   
    app.get("/login", (req, res, next) => {
      
        if (req.session.backURL) {
            req.session.backURL = req.session.backURL; 
        } else if (req.headers.referer) {
            const parsed = parse(req.headers.referer);
            if (parsed.hostname === app.locals.domain) {
                req.session.backURL = parsed.path;
            }
        } else {
            req.session.backURL = "/";
        }
        
        next();
    },
        passport.authenticate("discord"));

    
    app.get("/callback", passport.authenticate("discord", { failureRedirect: "/" }), (req, res) => {
        if (req.session.backURL) {
            const url = req.session.backURL;
            req.session.backURL = null;
            res.redirect(url);
        } else {
            res.redirect("/");
        }
    });

    app.get("/logout", function (req, res) {
        
        req.session.destroy(() => {
            req.logout();
            res.redirect("/");
        });
    });

    app.get("/", (req, res) => {
        renderTemplate(res, req, "index.ejs");
    });

    app.get("/status", async (req, res) => {

        const shards = client.shards;

        renderTemplate(res, req, "status.ejs", { shards });

    });

    app.get("/commands", async (req, res) => {

        renderTemplate(res, req, "commands.ejs");

    });

    app.listen(config.PORT, null, null, () => Logger.system("DASHBOARD", `Dashboard Is Up And Running On Port ${config.PORT}.`));
}       