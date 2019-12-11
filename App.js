import React, { Component } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Audio } from 'expo-av';
import * as Font from 'expo-font';
import ScoreModal from './components/ScoreModal';

class App extends Component {
  constructor(props) {
    super(props);
    this.red = React.createRef();
    this.blue = React.createRef();
    this.green = React.createRef();
    this.yellow = React.createRef();

    this.state = {
      SIMON_MODEL: ['red', 'blue', 'green', 'yellow'],
      ROUND: [],
      USER: [],
      successfullRound: 0,
      player: 0,
      roundNumber: 0,
      userLastScore: 0,
      redSound: new Audio.Sound(),
      blueSound: new Audio.Sound(),
      greenSound: new Audio.Sound(),
      yellowSound: new Audio.Sound(),
      errorSound: new Audio.Sound(),
      modalVisible: false,
      TextInputValue: '',
      fiveHi: [],
      fontLoaded: false,
      buttonDis: true,
      startDis: false,
    };
  }

  componentDidMount() {
    this.fontLoad();
  }
  async fontLoad() {
    await Font.loadAsync({
      'press-start': require('./assets/fonts/PressStart2P-Regular.ttf'),
    });

    this.setState({ fontLoaded: true });
  }

  setModalVisible(visible) {
    this.setState({ modalVisible: visible });
  }

  getRandomIntInclusive(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min; //The maximum is inclusive and the minimum is inclusive
  }

  getRandomColor() {
    return this.state.SIMON_MODEL[
      this.getRandomIntInclusive(0, this.state.SIMON_MODEL.length - 1)
    ];
  }

  playRound() {
    this.setState({ startDis: true });
    var currentColor = this.getRandomColor();
    this.state.ROUND.push(currentColor);
    this.renderRound();
  }

  async getSound(currColor) {
    await this.state[`${currColor}Sound`].unloadAsync();
    if (currColor === 'red') {
      await this.state[`redSound`].loadAsync(
        require('./assets/sound/redSound.mp3')
      );
    } else if (currColor === 'blue') {
      await this.state[`blueSound`].loadAsync(
        require('./assets/sound/blueSound.mp3')
      );
    } else if (currColor === 'green') {
      await this.state[`greenSound`].loadAsync(
        require('./assets/sound/greenSound.mp3')
      );
    } else if (currColor === 'yellow') {
      await this.state[`yellowSound`].loadAsync(
        require('./assets/sound/yellowSound.mp3')
      );
    }
    await this.state[`${currColor}Sound`].playAsync();
  }

  renderRound() {
    for (let i = 0; i < this.state.ROUND.length; i++) {
      setTimeout(async () => {
        var currentColor = this.state.ROUND[i]
        this[currentColor].current.setOpacityTo(0.2);
         await this.getSound(this.state.ROUND[i]);
        setTimeout(() => {
          this[currentColor].current.setOpacityTo(1);
          if (
            this.state.ROUND[i] === this.state.ROUND[this.state.ROUND.length - 1]
          ) {
            this.setState({ buttonDis: false });
          }
        }, 1200);
      }, i * 1000);
    }
  }

  pressedButton(color) {
    this.setState({ roundNumber: this.state.roundNumber++ });
    this.getSound(color);
    this.state.USER.push(color);
    if (this.state.ROUND.length === this.state.USER.length) {
      this.RoundCheck();
    }
  }

  async RoundCheck() {
    this.setState({ buttonDis: true });

    var userArr = JSON.stringify(this.state.USER);
    var roundArr = JSON.stringify(this.state.ROUND);
    if (roundArr === userArr) {
      this.state.successfullRound = 1;
      this.state.USER = [];
    } else {
      this.state.successfullRound = 0;
      await this.state[`errorSound`].unloadAsync();
      await this.state[`errorSound`].loadAsync(
        require('./assets/sound/error.wav')
      );
      await this.state[`errorSound`].playAsync();
    }
    this.nextRound();
  }

  nextRound() {
    if (this.state.successfullRound === 1) {
      this.setState({ roundNumber: this.state.roundNumber++ });
      setTimeout(() => {
        this.playRound();
      }, 1500);
    } else {
      this.setState({ userLastScore: this.state.roundNumber });
      this.setState({ roundNumber: 0 });
      this.setState({ startDis: false });

      this.setState({ successfullRound: 0 });
      this.setState({ ROUND: [] });
      this.setState({ USER: [] });
      this.setModalVisible(true);
    }
  }

  render() {
    return (
      <>
        <View style={{ marginTop: 22 }}>
          <View style={{ marginTop: 22 }}>
            <Modal
              animationType="slide"
              transparent={false}
              visible={this.state.modalVisible}>
              <ScoreModal
                onRef={ref => (this.parentReference = ref)}
                setModalVisible={this.setModalVisible.bind(this)}
                TextInputValue={this.state.TextInputValue}
                userLastScore={this.state.userLastScore}
              />
            </Modal>
          </View>
        </View>

        <View
          style={{
            flex: 1,
            justifyContent: 'center',
          }}>
          <View
            style={{
              flex: 4,
              flexWrap: 'wrap',
              alignContent: 'stretch',
              position: 'relative',
            }}>
            <View style={{ flex: 2, flexDirection: 'row' }}>
              <TouchableOpacity
                ref={this.red}
                style={{ flex: 1, backgroundColor: 'red' }}
                onPress={() => this.pressedButton(this.state.SIMON_MODEL[0])} // Action
                disabled={this.state.buttonDis}
              />
              <TouchableOpacity
                ref={this.blue}
                style={{ flex: 1, backgroundColor: 'blue' }}
                onPress={() => this.pressedButton(this.state.SIMON_MODEL[1])} // Action
                disabled={this.state.buttonDis}
              />
            </View>
            <View style={{ flex: 2, flexDirection: 'row' }}>
              <TouchableOpacity
                ref={this.green}
                style={{ flex: 1, backgroundColor: 'green' }}
                onPress={() => this.pressedButton(this.state.SIMON_MODEL[2])} // Action
                disabled={this.state.buttonDis}
              />
              <TouchableOpacity
                ref={this.yellow}
                style={{ flex: 1, backgroundColor: 'yellow' }}
                onPress={() => this.pressedButton(this.state.SIMON_MODEL[3])} // Action
                disabled={this.state.buttonDis}
              />
            </View>
          </View>
          <View style={styles.startButton}>
            <Image
              style={{ marginTop: 40 }}
              source={require('./simonlogo.png')}
            />
            {this.state.fontLoaded ? (
              <TouchableOpacity
                onPress={() => {
                  this.playRound();
                }}
                disabled={this.state.startDis}>
                <View style={{ margin: 7 }}>
                  <Text
                    style={{
                      color: 'white',
                      fontFamily: 'press-start',
                      fontSize: 13,
                    }}>
                    START!
                  </Text>
                </View>
              </TouchableOpacity>
            ) : null}
            {this.state.fontLoaded ? (
              <Text
                style={{
                  margin: 8,
                  color: 'red',
                  fontFamily: 'press-start',
                  fontSize: 30,
                }}>
                {this.state.roundNumber}
              </Text>
            ) : null}
          </View>
        </View>
      </>
    );
  }
}
const styles = StyleSheet.create({
  startButton: {
    padding: 5,
    height: 200,
    width: 200,
    borderRadius: 400,
    backgroundColor: 'black',
    color: 'white',
    flex: 1,
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    alignContent: 'center',
  },
});
export default App;
