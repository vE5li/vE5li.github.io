#!/usr/bin/env python

import asyncio
import websockets

async_state = type('', (), {})()
async_state.light_state = False
async_state.lamp_state = False
async_state.portal_state = False
async_state.television_state = False
async_state.shelf_state = False
async_state.desk_state = False
async_state.shelf_color = "ffffff"
async_state.desk_color = "ffffff"

clients = []

def state_from_character(character):
    return character == '1'

def character_from_state(state):
    return '1' if state else '0'

async def update_switch_states(state, character):
    message = character + character_from_state(state)
    for client in clients:
        await client.send(message)

async def update_indicator_color(color, character):
    message = character + color
    for client in clients:
        await client.send(message)

async def echo(socket, path):
    clients.append(socket)

    try:
        while True:
            message = await socket.recv()
            target = message[0]

            if target == '0':
                message = target + character_from_state(async_state.light_state) + character_from_state(async_state.lamp_state) + character_from_state(async_state.portal_state) + character_from_state(async_state.television_state) + character_from_state(async_state.shelf_state) + character_from_state(async_state.desk_state) + async_state.shelf_color + async_state.desk_color
                await socket.send(message)

            elif target == 'm':
                message = message[1:]
                print("message for you: " + message)

            elif target == 'L':
                state = state_from_character(message[1])
                async_state.light_state = state
                await update_switch_states(state, target)

            elif target == 'l':
                state = state_from_character(message[1])
                async_state.lamp_state = state
                await update_switch_states(state, target)

            elif target == 'p':
                state = state_from_character(message[1])
                async_state.portal_state = state
                await update_switch_states(state, target)

            elif target == 't':
                state = state_from_character(message[1])
                async_state.television_state = state
                await update_switch_states(state, target)

            elif target == 's':
                state = state_from_character(message[1])
                async_state.shelf_state = state
                await update_switch_states(state, target)

            elif target == 'd':
                state = state_from_character(message[1])
                async_state.desk_state = state
                await update_switch_states(state, target)

            elif target == 'S':
                color = message[1:]
                async_state.shelf_color = color
                await update_indicator_color(color, target)

            elif target == 'D':
                color = message[1:]
                async_state.desk_color = color
                await update_indicator_color(color, target)

            else:
                await socket.send("X")

    except websockets.ConnectionClosedOK:
        clients.remove(socket)

    except websockets.ConnectionClosedError:
        clients.remove(socket)

    except RuntimeError:
        clients.remove(socket)

start_server = websockets.serve(echo, port=8765)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()
