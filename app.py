from flask import Flask, make_response, render_template, request, jsonify, session, redirect, url_for
import requests
import wikipediaapi
import pyttsx3
from gtts import gTTS
import os
from googletrans import Translator


app = Flask(__name__)
app.secret_key = 'your_secret_key_here'  # Set a secret key for session management

# Initialize Wikipedia API and pyttsx3 Text-to-Speech engine with custom user agent
wiki_api = wikipediaapi.Wikipedia(
    language='en',  # Use English for the initial lookup
    user_agent='WikiGps/1.0'  # Your application name and version
)
engine = pyttsx3.init()
translator = Translator()

# Route to render the index.html template
@app.route('/')
def welcome():
    return render_template('welcome.html')

# Route to render the main.html template
@app.route('/main')
def main():
    username = request.cookies.get('username')
    if username:
        return render_template('main.html', username=username)
    else:
        # Handle case where username cookie is not present
        return render_template('login.html') 
# Route to render the signup.html template
@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        try:
            username = request.form.get('username')
            password = request.form.get('password')

            # Dummy storage of username and password in cookies (replace with secure storage)
            response = make_response(jsonify({'message': 'Signup successful'}))
            response.set_cookie('username', username, httponly=True, secure=True, samesite='Strict')
            response.set_cookie('password', password, httponly=True, secure=True, samesite='Strict')
            return response

        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return render_template('signup.html')


# Route to handle login POST requests
@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        try:
            username = request.form.get('username')
            password = request.form.get('password')
            # Retrieve stored username and password from cookies (for demo purposes)
            stored_username = request.cookies.get('username')
            stored_password = request.cookies.get('password')
            # Dummy authentication logic (replace with actual logic)
            if username == stored_username and password == stored_password:
                return jsonify({'message': 'Login successful', 'username': username}), 200
            else:
                return jsonify({'error': 'Invalid credentials'}), 401
        except Exception as e:
            return jsonify({'error': str(e)}), 500
    return render_template('login.html')

# Route to handle POST requests from index.html to get city and Wikipedia info
@app.route('/get_city', methods=['POST'])
def get_city():
    try:
        data = request.json  # Retrieve JSON data sent from frontend
        latitude = data['latitude']
        longitude = data['longitude']

        # Perform some processing (e.g., using LocationIQ API)
        city = get_city_from_coordinates(latitude, longitude)

        if city == 'Unknown City':
            return jsonify({'error': 'Error retrieving city name.'}), 500

        # Get Wikipedia summary for the city
        wiki_summary = get_wikipedia_summary(city)

        if wiki_summary is None:
            return jsonify({'error': 'Error retrieving Wikipedia information.'}), 500

        # Return JSON response to frontend
        return jsonify({'city': city, 'wiki_summary': wiki_summary})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def get_city_from_coordinates(latitude, longitude):
    # Example function to fetch city name from coordinates using an API
    api_key = 'pk.10212f6c37cb253f95754a9a11aec742'
    url = f'https://us1.locationiq.com/v1/reverse.php?key={api_key}&lat={latitude}&lon={longitude}&format=json'

    try:
        response = requests.get(url)
        response.raise_for_status()
        data = response.json()

        if 'address' in data:
            if 'city' in data['address']:
                print(data['address']['city'])
                return data['address']['city']
            elif 'town' in data['address']:
                print(data['address']['town'])
                return data['address']['town']
            elif 'village' in data['address']:
                print(data['address']['village'])
                return data['address']['village']
        return 'Unknown City'  # Fallback if no city, town, or village found
    
    except requests.exceptions.RequestException as e:
        print(f"Error retrieving city: {e}")
        return 'Unknown City'

def get_wikipedia_summary(city):
    # Function to fetch Wikipedia summary for the given city
    try:
        page = wiki_api.page(city)
        if page.exists():
            return page.summary[:500]  # Limit to first 500 characters of summary
        else:
            return None
    except wikipediaapi.exceptions.WikipediaException as e:
        print(f"Error retrieving Wikipedia info: {e}")
        return None

@app.route('/speak', methods=['POST'])
def speak():
    data = request.json
    text = data.get('text', '')
    language = data.get('language', 'english')

    try:
        if language == 'english':
            engine.setProperty('rate', 150)  # Speed of speech
            engine.say(text)
            engine.runAndWait()
        elif language == 'hebrew':
            tts = gTTS(text=text, lang='he')
            tts.save('output.mp3')
            # Code to play the saved audio file or stream it to the client
            return jsonify({'message': 'Speaking initiated.'}), 200
        else:
            return jsonify({'error': f'Language {language} not supported.'}), 400

        return jsonify({'message': 'Speaking initiated.'}), 200

    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
def speak_text(text, language):
    if language == 'english':
        engine.setProperty('rate', 150)  # Speed of speech
        engine.say(text)
        engine.runAndWait()
    elif language == 'hebrew':
        tts = gTTS(text=text, lang='he')
        tts.save('output.mp3')
        os.system('start output.mp3')
    else:
        raise ValueError(f"Language '{language}' not supported.")

@app.route('/translate', methods=['POST'])
def translate():
    try:
        data = request.json
        text = data['text']
        language = data['language']
        translated_text = translate_text(text, language)
        return jsonify({'translated_text': translated_text})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

def translate_text(text, language):
    if language == 'hebrew':
        translated = translator.translate(text, dest='he')
        return translated.text
    else:
        return text

if __name__ == '__main__':
    app.run(debug=True)
