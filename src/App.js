import React, { Component } from 'react'
import faker from 'faker'

import createStreamerFrom from './api/streamer'
import generateCarData from './api/data-generator'

import { Button, Checkbox, EventNotification, Input } from './components'

import './App.scss'

class App extends Component {
  state = {
    carData: new Map(),
    carStreamers: new Map(),
    colorsMap: new Map(),
    filteredVins: new Map(),
    newVinInput: '',
    isFilterEventsByFuelOn: false,
  }

  initStreamer = vin => {
    const { carData, carStreamers, filteredVins } = this.state
    const streamer = carStreamers.get(vin)

    streamer.subscribe(newCarData => {
      const newCarDataValue = carData.set(vin, newCarData)

      if (parseFloat(newCarData.fuel) < 0.15) {
        filteredVins.set(vin, true)
      } else {
        filteredVins.set(vin, false)
      }

      this.setState({ carData: newCarDataValue, filteredVins })
    })

    streamer.start()
  }

  stopStreamer = vin => {
    const { carStreamers } = this.state
    const streamer = carStreamers.get(vin)

    streamer.stop()
  }

  toggleStreamer = vin => {
    const { carStreamers } = this.state
    const streamer = carStreamers.get(vin)

    if (streamer.isStreaming) {
      this.stopStreamer(vin)
    } else {
      this.initStreamer(vin)
    }
  }

  addNewVin = () => {
    const { carData, carStreamers, colorsMap } = this.state
    const newVin = this.state.newVinInput
    if (!newVin) return
    const newCar = () => generateCarData(newVin)
    const newCarStreamer = createStreamerFrom(newCar)
    const color = faker.internet.color()

    // setters
    carData.set(newVin, newCar())
    carStreamers.set(newVin, newCarStreamer)
    colorsMap.set(newVin, color)

    this.initStreamer(newVin)

    // clear input
    this.clearNewVinInput()
  }

  setNewVinInput = vin => {
    this.setState({ newVinInput: vin })
  }

  clearNewVinInput = () => {
    this.setState({ newVinInput: '' })
  }

  toggleFilterEventsByFuel = event => {
    const { checked } = event.target
    this.setState({ isFilterEventsByFuelOn: checked })
  }

  render() {
    const { colorsMap, filteredVins, isFilterEventsByFuelOn } = this.state

    const InputWrapperStyle = {
      marginTop: 30,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
    }

    const InputStyle = {
      boxSizing: 'border-box',
      height: 35,
      marginRight: 10,
      paddingLeft: 10,
    }

    const AddButtonStyle = {
      height: 35,
    }

    return (
      <div className="App">
        <aside className="App-aside">
          <div style={InputWrapperStyle}>
            <Input
              type="text"
              placeholder="Enter vin"
              value={this.state.newVinInput}
              onChange={event => this.setNewVinInput(event.target.value)}
              style={InputStyle}
            />
            <Button
              type="button"
              style={AddButtonStyle}
              onClick={this.addNewVin}>
              Add
            </Button>
          </div>

          <div style={{ width: '50%', margin: '30px auto' }}>
            {[...this.state.carData.entries()].map(([vin]) => {
              const { carStreamers } = this.state
              const streamer = carStreamers.get(vin)
              return (
                <Checkbox
                  key={vin}
                  defaultChecked={streamer.isStreaming}
                  onChange={() => this.toggleStreamer(vin)}>
                  <div style={{ color: colorsMap.get(vin) }}>
                    <span style={{ display: 'flex', alignItems: 'center' }}>
                      <svg height="20" width="20">
                        <circle
                          cx="10"
                          cy="10"
                          r="5"
                          strokeWidth="0"
                          fill={colorsMap.get(vin)}></circle>
                      </svg>
                      {vin}
                    </span>
                  </div>
                </Checkbox>
              )
            })}
          </div>
        </aside>

        <section className="App-section">
          <header className="App-header">
            <Checkbox
              defaultChecked={isFilterEventsByFuelOn}
              onClick={event => this.toggleFilterEventsByFuel(event)}>
              Filter events where fuel level is under 15%
            </Checkbox>
          </header>
          <div className="App-content">
            {[...this.state.carData.entries()].map(([vin, carData]) => {
              if (filteredVins.get(vin) && isFilterEventsByFuelOn) {
                return null
              }
              return (
                <EventNotification
                  key={vin}
                  carEvent={carData}
                  color={colorsMap.get(vin)}
                  style={{ marginBottom: 20 }}
                />
              )
            })}
          </div>
        </section>
      </div>
    )
  }
}

export default App
