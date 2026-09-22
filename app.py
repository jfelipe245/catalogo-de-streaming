import sqlite3
from flask import Flask, render_template, request, redirect, url_for, session
from flask_migrate import Migrate
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

app.secret_key = "afroedu-streming"
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:/// login.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)
cadastro = "login.db"

class Usuario(db.Model):
    __tablename__ = "Usuarios"

    id = db.Column(db.Integer, primary_key=True)
    nome_usuario = db.Column(db.String(100), nullable=False)
    nome = db.Column(db.String(100), nullable=False)
    idade = db.Column(db.Integer, nullable=False)
    cpf = db.Column(db.String(14), unique=True, nullable=False)
    data_nascimento = db.Column(db.String(10), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    telefone = db.Column(db.String(20))
    senha = db.Column(db.String(100), nullable=False)
    rua = db.Column(db.String(100), nullable=False)
    bairro = db.Column(db.String(100), nullable=False)
    endereco = db.Column(db.String(200), nullable=False)

def inicializar_banco():
    with app.app_context():
        db.create_all()

# ------------------------------
# ROTAS DAS PAGINAS
# ------------------------------

@app.route("/")
def home():
    return redirect(url_for("login"))


@app.route("/login", methods=["GET", "POST"])
def login():
    if request.method == "POST":
        email = request.form.get("email", "").strip()
        senha = request.form.get("senha", "")

        usuario=Usuario.query.filter_by(email = email, senha = senha
            ).first()

        if usuario:
            session["usuario_id"] = usuario.id
            session["usuario_nome"] = usuario.nome
            session["usuario_email"] = usuario.email
            return redirect(url_for("catalogo"))

        return render_template("login.html", mensagem="E-mail ou senha incorretos.")

    return render_template("login.html")


@app.route("/catalogo")
def catalogo():
    if "usuario_id" not in session:
        return redirect(url_for("login"))
    return render_template("catalogo.html")


@app.route("/favoritos")
def favoritos():
    if "usuario_id" not in session:
        return redirect(url_for("login"))
    return render_template("meus_favoritos.html")


@app.route("/saiba-mais")
def saiba_mais():
    if "usuario_id" not in session:
        return redirect(url_for("login"))
    return render_template("Saiba-Mais.html")


@app.route("/logout")
def logout():
    session.clear()
    return redirect(url_for("login"))


# ------------------------------
# CADASTRO DE USUARIO
# ------------------------------

@app.route("/Usuarios", methods=["GET", "POST"])
def cadastrar_usuarios():
    if request.method == "POST":
        nome_usuario = request.form.get("Nome Usuario", "")
        nome = request.form.get("nome", "")
        idade = request.form.get("Idade", "")
        cpf = request.form.get("cpf", "")
        data_nascimento = request.form.get("Data_Nascimento", "")
        email = request.form.get("E-mail", "")
        telefone = request.form.get("Telefone", "")
        senha = request.form.get("Senha", "")
        rua = request.form.get("Rua", "")
        bairro = request.form.get("Bairro", "")
        endereco = request.form.get("Eendereço", request.form.get("Endereço", ""))

        try:
            with sqlite3.connect(cadastro) as conexao:
                cursor = conexao.cursor()
                cursor.execute("""
                    INSERT INTO Usuarios
                    (nome_usuario, nome, idade, cpf, data_nascimento, email,
                     telefone, senha, rua, bairro, endereco)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """, (
                    nome_usuario, nome, idade, cpf, data_nascimento, email,
                    telefone, senha, rua, bairro, endereco
                ))
                conexao.commit()

            return redirect(url_for("login"))

        except sqlite3:
            return render_template("login.html", mensagem="E-mail ou CPF já cadastrado.")

    return render_template("login.html")

if __name__ == "__main__":
    inicializar_banco()
    app.run(debug=True) 
