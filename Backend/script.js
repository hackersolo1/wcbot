const TelegramBot = require('node-telegram-bot-api');
const mysql = require('mysql2/promise');
require('dotenv').config();



const bot = new TelegramBot(process.env.TG_TOKEN, { polling: true });


// ======================
// /ajuda
// =======================
bot.onText(/\/ajuda/, (msg) => {
    const helpMessage = `
Aqui estão os comandos disponíveis:

/ajuda - Mostra esta mensagem de ajuda

/start - Inicia o bot

/cadastro - Cria um novo cadastro para seu número de telefone

/enviarMensagem - Envia uma mensagem para um número de telefone específico. Insira o ID do usuário e a mensagem após o comando, separados por um espaço. Exemplo: /enviarMensagem 1234567890 Oi, tudo bem?

/listarUsuarios - Lista os ID's e nome de usuários (usernames) de todos os usuários já registrados. Cuidado: a lista pode ser grande!

/dev - Sobre o bot
`;
    bot.sendMessage(msg.chat.id, helpMessage);
});


// ======================
// /cadastro
// =======================
bot.onText(/\/cadastro/, async (msg) => {
    const chatId = msg.chat.id;
    const userId = msg.from.id;
    const userName = msg.from.username || msg.from.first_name;
    const firstName = msg.from.first_name;
    const lastName = msg.from.last_name;
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: process.env.DB_PORT,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
        const [rows] = await connection.query(`SELECT * FROM users WHERE chat_id = ?`, [chatId]);
        if (rows.length == 0) {
            await connection.query(
                'INSERT INTO users (chat_id, username, first_name, last_name) VALUES (?, ?, ?, ?)',
                [chatId, userName, firstName, lastName]
            );
            bot.sendMessage(chatId, `Cadastro criado com sucesso! Seu ID de usuário é ${userId}.`);
        } else {
            bot.sendMessage(chatId, `Usuário já cadastrado com o nome de ${rows[0].first_name} | ${rows[0].first_name || ''} ${rows[0].last_name || ''}.`)
        }

    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        bot.sendMessage(chatId, `Ocorreu um erro ao tentar criar o cadastro.

Informações técnicas (ignore isso se não for programador): 
${error}`);
    }
});



// ======================
// /start
// =======================
bot.onText(/\/start/, async (msg) => {
    bot.sendMessage(msg.chat.id, `Bem-vindo, ${msg.from.first_name}! Verificando se você já tem cadastro. Aguarde...`);
    const connection = await mysql.createConnection({
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
        port: process.env.DB_PORT,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
    });
    const [rows] = await connection.query('SELECT * FROM users WHERE chat_id = ?', [msg.chat.id]);
    if(rows.length > 0) {
        bot.sendMessage(msg.chat.id, `Parece que você já tem cadastro:
Seu Chat_ID: ${rows[0].chat_id}
Use /ajuda para ver os comandos disponíveis.`);
    } else {
        bot.sendMessage(msg.chat.id, 'Parece que você ainda não se cadastrou. Use /cadastro para registrar seu número ou /ajuda para ver os comandos disponíveis.')
    }
});



// ======================
// /enviarMensagem
// =======================
bot.onText(/\/enviarMensagem/, async (msg) => {
    const args = msg.text.split(' ');
    const chatId = args[1];
    const message = args.slice(2).join(' ');
    if (!message) {
        bot.sendMessage(msg.chat.id, 'Insira o ID e/ou a mensagem!');
        return;
    }

    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: process.env.DB_PORT,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });
        const result = await connection.query(
            'SELECT * FROM users WHERE chat_id = ?',
            [chatId]
        );
        if (result[0].length > 0) {
            bot.sendMessage(chatId, message);
        } else {
            bot.sendMessage(msg.chat.id, 'Usuário não encontrado.');
        }
    } catch (error) {
        console.error('Erro ao conectar ao banco de dados:', error);
        bot.sendMessage(msg.chat.id, `Ocorreu um erro ao tentar enviar a mensagem.

Informações técnicas (ignore isso se não for programador): 
${error}`);
    }
});



// ======================
// /listarUsuarios
// =======================
bot.onText(/\/listarUsuarios/, async (msg) => {
    const lista = [];
    try {
        const connection = await mysql.createConnection({
            host: process.env.DB_HOST,
            user: process.env.DB_USER,
            port: process.env.DB_PORT,
            password: process.env.DB_PASSWORD,
            database: process.env.DB_DATABASE
        });

        const [rows] = await connection.query('SELECT * FROM users');
        rows.forEach((d) => {
            const m = `Chat_ID: ${d.chat_id}\nUsername: @${d.username || "Nome de usuário desconhecido"}\nNome: ${d.first_name || "Sem nome"}\nSobrenome: ${d.last_name || "Sem sobrenome"}\n\n\n`;
            lista.push(m);
        });
        bot.sendMessage(msg.chat.id, `Lista de todos os usuários: \n\n
${lista}`);
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        bot.sendMessage(msg.chat.id, `Ocorreu um erro listar os usuários.

Informações técnicas (ignore isso se não for programador): 
${error}`);
    }
});

bot.onText(/\/dev/, (msg) => {
    bot.sendMessage(msg.chat.id, `
WcBot v1.0

Sistema corporativo de automação para notificações internas da Icomon.

Desenvolvido por Paulo G.
Contato técnico:
📞 (41) 99865-6934`);
});

const express = require('express');
const app = express();

app.listen(3000, () => {
    console.log('Servidor online');
});
