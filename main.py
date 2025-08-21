from flask import Flask, render_template, request
import requests
import datetime

app = Flask(__name__, template_folder='frontend')

API_KEY = "ca77bd08362e957a069864c6068e71fb"
BASE_URL = "http://api.openweathermap.org/data/2.5/weather"

def getWeather(city):
    url = f"{BASE_URL}?q={city}&appid={API_KEY}&units=metric&lang=id"
    response = requests.get(url)
    return response.json()

@app.route("/", methods=["GET", "POST"])
def home():
    # Waktu sekarang
    now = datetime.datetime.now()
    current_time = now.strftime("%H:%M")  # jam:menit
    current_date = now.strftime("%A, %d %B %Y")  # Monday, 02 April 2025

    # Capitalize hari dan bulan
    current_date = current_date.title()  # jadi huruf besar di awal tiap kata

    weather_data = {
        "time": current_time,
        "date": current_date
    }

    if request.method == "POST":
        city = request.form.get("city")
        data = getWeather(city)

        if data["cod"] == 200:
            weather_data.update({
                "nama_kota": data["name"],
                "icon": data["weather"][0]["icon"],
                "tanggal": datetime.datetime.now().strftime("%d-%m-%Y %H:%M:%S"),
                "suhu": data["main"]["temp"],
                "kondisi": data["weather"][0]["description"],
                "kelembapan": data["main"]["humidity"],
            })
        else:
            weather_data = {"error": "Kota tidak ditemukan!"}

    return render_template("index.html", weather=weather_data)

@app.route("/weather_by_coord")
def weather_by_coord():
    lat = request.args.get("lat")
    lon = request.args.get("lon")

    url = f"{BASE_URL}?lat={lat}&lon={lon}&appid={API_KEY}&units=metric&lang=id"
    data = requests.get(url).json()

    if data["cod"] == 200:
        weather_data = {
            "nama_kota": data["name"],
            "icon": data["weather"][0]["icon"],
            "tanggal": datetime.datetime.now().strftime("%d-%B-%Y %H:%M:%S"),
            "suhu": round(data["main"]["temp"]),
            "kondisi": data["weather"][0]["description"],
            "kelembapan": data["main"]["humidity"]
        }
        return weather_data
    else:
        return {"error": "Lokasi tidak ditemukan"}
    
if __name__ == "__main__":
    app.run(debug=True)