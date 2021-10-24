# Moveo-Task

9 pads loop machine  –  Sapir Ohava 

url link of the deployed project - 
https://thawing-headland-49280.herokuapp.com/

In this work I used audio web api, For me this is the most convenient library to work with audios that also can play several audios simultaneously,
The way to work with this library is to create an audio graph,
Which consists of source nodes that wrap audio elements
Which indicate gain nodes whose function is to edit the sound
(Increase volume, decrease volume, change audio frequency, etc.)
And they indicate destination nodes that output the sound to our speakers
In addition, I wrote the bonus which allows to record the sound created by the user in a 9 pads loop machine

Instructions:

First the user must press at least one of the pads and then press the pause / play button
Then the sound of the pads selected together will be played together immediately
Then if the user clicks on another pad, the sound of this pad will be heard only at the beginning of the next cycle, if the user wants to stop a certain pad, he must click on the same pad again, and the sound of that pad will stop immediately

in the  bonus:

If the user wants to record the sound he creates in the machine,
He must press the start / stop recording button
As soon as the user wants to stop recording he has to press the same button again, and then a new play recording button will appear on the screen, which when the user clicks on it, the user will hear the sound he recorded

