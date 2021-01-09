from flask import Flask
from flask_login import LoginManager
from flask_mail import Mail
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from itsdangerous import URLSafeTimedSerializer
from agil.config import Config
import os

mail = Mail()
db = SQLAlchemy()
bcrypt = Bcrypt()
login_manager = LoginManager()
ts = URLSafeTimedSerializer(Config.SECRET_KEY)


def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)
    db.init_app(app)
    bcrypt.init_app(app)
    login_manager.init_app(app)
    mail.init_app(app)

    from agil.Error.routes import error
    from agil.Chef.routes import chef
    from agil.Administrateur.routes import admin
    from agil.Main.routes import approot

    app.register_blueprint(chef)
    app.register_blueprint(admin)
    app.register_blueprint(approot)
    app.register_blueprint(error)

    if not app.debug:
        import logging
        from logging.handlers import RotatingFileHandler
        if not os.path.exists('log'):
            os.mkdir('log')
        file_handler = RotatingFileHandler('log/agil.log', 'a', 1 * 1024 * 1024, 10)
        file_handler.setLevel(logging.INFO)
        file_handler.setFormatter(logging.Formatter(
            '%(asctime)s %(levelname)s: %(message)s [in %(pathname)s:%(lineno)d]'))
        app.logger.addHandler(file_handler)
        app.logger.setLevel(logging.INFO)
        app.logger.info('Société Nationale de Distribution des Pétroles AGIL')

    return app
