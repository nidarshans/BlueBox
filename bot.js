'use strict';

/**
 * A ping pong bot, whenever you send "ping", it replies "pong".
 */

// Import the discord.js module
const Discord = require('discord.js');
var fs = require('fs');
// Create an instance of a Discord client
const client = new Discord.Client();
var wtemp = [];
var btemp = [];
var wstr = '';
var bstr = '';
/**
 * The ready event is vital, it means that only _after_ this will your bot start reacting to information
 * received from Discord
 */
client.on('ready', () => {
  console.log('I am ready!');
});

// Create an event listener for messages
// blu add -w :text

client.on('message', message => {
  const msg = message.content;
  if(msg.substring(0, msg.indexOf(' ')) == 'bb') {

    if(msg.includes('add', 3)) {
      if(msg.includes('-w')) {
        wtemp.push(msg.substring(msg.indexOf(':') + 1));
        message.channel.send('Registered white card');
      }
      if(msg.includes('-b')) {
        btemp.push(msg.substring(msg.indexOf(':') + 1));
        message.channel.send('Registered blue card');
      }
    }

    if(msg.includes('ls', 3)) {
      if(msg.includes('-w')) {
        if(!msg.includes('--save')) message.channel.send('[' + wtemp + ']');
        if(msg.includes('--save')) {
          message.channel.send('[' + wtemp + ']');
          wstr += '[\n';
          for(var x = 0; x < wtemp.length; x++) {
            wstr += ('"' + wtemp[x] + '", ');
            if(x % 5 == 0) wstr += '\n';
          }
          wstr += '\n]';
          fs.writeFile('./wdeck.txt', wstr, (err)=>{
            if(err) throw err;
            message.channel.send('Successfully saved file');
          });
        }
      }

      if(msg.includes('-b')) {
        if(!msg.includes('--save')) message.channel.send('[' + btemp + ']');
        if(msg.includes('--save')) {
          message.channel.send('[' + btemp + ']');
          bstr += '[\n';
          for(var x = 0; x < btemp.length; x++) {
            bstr += ('"' + btemp[x] + '", ');
            if(x % 5 == 0) bstr += '\n';
          }
          bstr += '\n]';
          fs.writeFile('./bdeck.txt', bstr, (err)=>{
            if(err) throw err;
            message.channel.send('Successfully saved file');
          });
        }
      }
  }

    if(msg.includes('clr', 3)) {
    if(msg.includes('-w')) wtemp = [];
    if(msg.includes('-b')) btemp = [];
    message.channel.send('Cleared array');
  }

    if(msg.includes('rm', 3)) {
    if(msg.includes('-w')) {
      var str = msg.substring(msg.indexOf(':') + 1);
      if(!msg.includes('--pop')) {
        for(var s = 0; s < wtemp.length; s++) {
          message.channel.send(wtemp[s] + ' : was removed');
          if(wtemp[s] == str) wtemp[s] = 'REMOVED';
        }
      }
      if(msg.includes('--pop')) {
        message.channel.send('Popped!');
        wtemp.pop();
      }
    }

    if(msg.includes('-b')) {
      var str = msg.substring(msg.indexOf(':') + 1);
      if(!msg.includes('--pop')) {
        for(var s = 0; s < btemp.length; s++) {
          message.channel.send(btemp[s] + ' : was removed');
          if(btemp[s] == str) btemp[s] = 'REMOVED';
        }
      }
      if(msg.includes('--pop')) {
        message.channel.send('Popped!');
        btemp.pop();
      }
    }
  }
  
  }
});

// Log our bot in using the token from https://discordapp.com/developers/applications/me
client.login('NjM3MDkyOTYxNDUyMDMyMDAx.XpdEZg.7YqUHRU4MJzotkzte7erZhM-1h4');
