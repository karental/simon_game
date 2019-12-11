import React, { Component } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableHighlight,
  Button,
} from 'react-native';
import { AsyncStorage } from 'react-native';
import { TextInput } from 'react-native';
import { Keyboard } from 'react-native';
import * as Font from 'expo-font';

class ScoreModal extends Component {
  constructor(props) {
    super(props);
    AsyncStorage.getItem('SCORE').then(res => { // get scores from asyncstorage
      if (res === null) {
        this.setState({
          fiveHi: [
            { name: 'noname', score: 0 },
            { name: 'noname', score: 0 },
            { name: 'noname', score: 0 },
            { name: 'noname', score: 0 },
            { name: 'noname', score: 0 },
          ],
        });
      } else {
        this.setState({ fiveHi: JSON.parse(res) });
      }
    });

    this.state = {
      userLastScore: this.props.userLastScore,
      modalVisible: this.props.modalVisible,
      TextInputValue: this.props.TextInputValue,
      fiveHi: [],
      submitButtonDis: false
    };
  }

  componentDidMount() {
    this.fontLoad();
  }
  async fontLoad() {
    await Font.loadAsync({
      'press-start': require('../assets/fonts/PressStart2P-Regular.ttf'),
    });

    this.setState({ fontLoaded: true });
  }

  SaveDataScore() { // save new data from users last game to state 
    Keyboard.dismiss();
    this.setState({submitButtonDis: true})
    let myObjectScore = {
      name: this.state.TextInputValue,
      score: this.state.userLastScore,
    };
    var highestScores = this.state.fiveHi;
    highestScores.sort(function(a, b) {
      return b.score - a.score;
    });

    if (highestScores.length < 5) {
      highestScores.push(myObjectScore);
      highestScores.sort(function(a, b) {
        return b.score - a.score;
      });
    } else if (
      myObjectScore.score >= highestScores[highestScores.length - 1].score
    ) {
      if (highestScores.length === 5) {
        highestScores.pop();
        highestScores.push(myObjectScore);
        highestScores.sort(function(a, b) {
          return b.score - a.score;
        });
      }
    }
    this.setState({ TextInputValue: '' });
    this._storeData(highestScores);
  }

  async _storeData(highestScores) { // save state to async storage
    await AsyncStorage.setItem('SCORE', JSON.stringify(highestScores));
    this._retrieveData();
  }

  async _retrieveData() { //get storage
    let value = await AsyncStorage.getItem('SCORE');
    value = JSON.parse(value);
    this.setState({ fiveHi: value });
  }

  render() {
    return (
      <>
        <View style={styles.modalContainer}>
          <View style={styles.innerContainer}>
            <Text style={styles.scoreModal}>
              Your Score Is: {this.state.userLastScore}
            </Text>
            <TextInput
              placeholder="Enter Your Name"
              onChangeText={TextInputValue => this.setState({ TextInputValue })}
              style={{
                width: 150,
                height: 30,
                borderColor: 'gray',
                borderWidth: 1,
                color: 'white',
              }}
            />
            <Button
              title="Submit Name"
              color='white'
            disabled= {this.state.submitButtonDis}
              onPress={() => {
                this.SaveDataScore();
              }}
            />
            <Text style={styles.textModal}>Top 5 Scores</Text>
            <View
              style={{
                texAlign: 'justify',
                textAlignLast: 'justify',
                textJustify: 'inter-word',
              }}>
              {this.state.fiveHi.map((t, index) => (
                <Text
                  key={{ index }}
                  style={{
                    color: 'white',
                    fontSize: 14,
                    fontFamily: 'press-start',
                    margin: 10,
                  }}>
                  {index + 1}. {t.name}.... {t.score}
                </Text>
              ))}
            </View>
            <TouchableHighlight
              onPress={() => {
                this.props.setModalVisible(false);
              }}>
              <Text style={styles.closeModal}>Close</Text>
            </TouchableHighlight>
          </View>
        </View>
      </>
    );
  }
}
const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'black',
    opacity: 0.9,
  },
  innerContainer: {
    alignSelf: 'center',

    alignItems: 'center',
    borderColor: 'cyan',
    borderWidth: 1,
    height: 450,
    width: 300,
    padding: 10,
    margin: 'auto',
  },
  textModal: {
    textAlign: 'center',
    color: 'yellow',
    fontSize: 18,
    fontFamily: 'press-start',
    margin: 10,
  },
  closeModal: {
    alignItems: 'center',
    //position: 'absolute',
    bottom: 0,
    color: 'red',
    fontSize: 24,
    fontFamily: 'press-start',
    marginTop: 5,
  },
  scoreModal: {
    textAlign: 'center',
    color: '#16fa25',
    fontSize: 17,
    fontFamily: 'press-start',
    margin: 13,
    lineHeight:30
      },
});
export default ScoreModal;
