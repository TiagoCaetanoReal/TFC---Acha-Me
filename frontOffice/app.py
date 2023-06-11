from flask import Flask
from models import db

def create_app(config_filename):
	app = Flask(__name__)
	app.config.from_object(config_filename)
	db.init_app(app)
	with app.app_context():
		db.create_all()
	return app

if __name__ == "__main__":
	app = create_app("config.DevelopmentConfig")
	print("Hi")