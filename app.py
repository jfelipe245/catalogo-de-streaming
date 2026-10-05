from flask import Flask, render_template, request, redirect, url_for,session
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
cadastro = "straming educacional.db"
app = Flask(__name__)
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///streaming educacional.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
migrate = Migrate(app, db)

class Usuario(db.Model):
    __tablename__ = 'Usuarios'

    id = db.Column(db.Integer, primary_key=True)
    nome = db.Column(db.String(100), nullable=False)
    email = db.Column(db.String(100), unique=True, nullable=False)
    senha = db.Column(db.String(100), nullable=False)

class Livros(db.Model):
    __tablename__ = 'Livros'

    id = db.Column(db.Integer, primary_key=True)
    genero = db.Column(db.String(50), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    imagem = db.Column(db.String(200), nullable=False)
    titulo = db.Column(db.String(100), nullable=False)
    autor = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    ano_publicacao = db.Column(db.Integer, nullable=False)
    ano_lancamento = db.Column(db.Integer, nullable=False)

class Filmes(db.Model):
    __tablename__ = 'Filmes'

    id = db.Column(db.Integer, primary_key=True)
    genero = db.Column(db.String(50), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    imagem = db.Column(db.String(200), nullable=False)
    titulo = db.Column(db.String(100), nullable=False)
    diretor = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    ano_lancamento = db.Column(db.Integer, nullable=False)

# class Series(db.Model):
#    __tablename__ = 'Series'#

#     id = db.Column(db.Integer, primary_key=True)
#     genero = db.Column(db.String(50), nullable=False)
#     tipo = db.Column(db.String(50), nullable=False)
#     imagem = db.Column(db.String(200), nullable=False)
#     titulo = db.Column(db.String(100), nullable=False)
#     diretor = db.Column(db.String(100), nullable=False)
#     descricao = db.Column(db.Text, nullable=False)
#     ano_lancamento = db.Column(db.Integer, nullable=False)

class Documentarios(db.Model):
    __tablename__ = 'Documentarios'

    id = db.Column(db.Integer, primary_key=True)
    genero = db.Column(db.String(50), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    imagem = db.Column(db.String(200), nullable=False)
    titulo = db.Column(db.String(100), nullable=False)
    diretor = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    ano_lancamento = db.Column(db.Integer, nullable=False)

class Curta_Metragem(db.Model):
    __tablename__ = 'Curta_Metragem'

    id = db.Column(db.Integer, primary_key=True)
    genero = db.Column(db.String(50), nullable=False)
    tipo = db.Column(db.String(50), nullable=False)
    imagem = db.Column(db.String(200), nullable=False)
    titulo = db.Column(db.String(100), nullable=False)
    diretor = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=False)
    ano_lancamento = db.Column(db.Integer, nullable=False)

# class Musica_de_protesto(db.Model):
#     __tablename__ = 'Musica_de_protesto'

#     id = db.Column(db.Integer, primary_key=True)
#     genero = db.Column(db.String(50), nullable=False)
#     tipo = db.Column(db.String(50), nullable=False)
#     imagem = db.Column(db.String(200), nullable=False)
#     titulo = db.Column(db.String(100), nullable=False)
#     artista = db.Column(db.String(100), nullable=False)
#     descricao = db.Column(db.Text, nullable=False)
#     ano_lancamento = db.Column(db.Integer, nullable=False)

class Favorito(db.Model):
    __tablename__ = 'Favoritos'

    id = db.Column(db.Integer, primary_key=True)
    usuario_id = db.Column(db.Integer, db.ForeignKey('Usuarios.id'), nullable=False)
    titulo = db.Column(db.String(100), nullable=False)
    categoria = db.Column(db.String(50), nullable=False)
    genero = db.Column(db.String(50), nullable=False)


class saiba_mais(db.Model):
    __tablename__ = 'Saiba_Mais'

    id = db.Column(db.Integer, primary_key=True)
    titulo = db.Column(db.String(100), nullable=False)
    descricao = db.Column(db.Text, nullable=False)

@app.route('/')
def home():
    return redirect(url_for('login'))

@app.route('/login', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        email = request.form.get('email')
        senha = request.form.get('senha')

        usuario = Usuario.query.filter_by(email=email, senha=senha).first()

        if usuario:
            session['usuario_id'] = usuario.id
            session['usuario_nome'] = usuario.nome
            return redirect(url_for('catalogo'))
        else:
            return render_template('login.html', error='Email ou senha inválidos.')
    return render_template('login.html')

@app.route('/cadastrar', methods=['GET', 'POST'])
def cadastrar_Usuario():
    if request.method == 'POST':
        nome = request.form.get('nome')
        email = request.form.get('email')
        senha = request.form.get('senha')

        novo_usuario = Usuario.query.filter_by(email=email).first()
        if novo_usuario:
            return render_template('login.html', error='Email já cadastrado.')

        novo_usuario = Usuario(nome=nome, email=email, senha=senha)
        try:
            db.session.add(novo_usuario)
            db.session.commit()
            return redirect(url_for('login'))
        except:
            db.session.rollback()
            return render_template('login.html', error='Erro ao cadastrar usuário.')
    return render_template('login.html')

@app.route('/logout')
def logout():
    session.clear()
    return redirect(url_for('login'))

@app.route('/catalogo')
def catalogo():
    if 'usuario_id' not in session:
        return redirect(url_for('login'))
    return render_template('catalogo.html', nome=session.get('usuario_nome'))

@app.route('/meus_favoritos')
def meus_favoritos():
    if 'usuario_id' not in session:
        return redirect(url_for('login'))
    favoritos = Favorito.query.filter_by(usuario_id=session['usuario_id']).all()   
    return render_template('meus_favoritos.html', favoritos=favoritos)

@app.route('/adicionar_favoritos', methods=['POST'])
def adicionar_favoritos():
    if 'usuario_id' not in session:
        return redirect(url_for('login'))

    titulo = request.form.get('titulo')
    categoria = request.form.get('categoria')
    genero = request.form.get('genero')

    novo_favorito = Favorito(usuario_id=session['usuario_id'], titulo=titulo, categoria=categoria, genero=genero)
    db.session.add(novo_favorito)
    db.session.commit()
    return redirect(url_for('catalogo', Favorito=novo_favorito))

@app.route('/remover_favoritos', methods=['POST'])
def remover_favoritos():
    if 'usuario_id' not in session:
        return redirect(url_for('login'))

    favorito = Favorito.query.get_or_404('favorito_id')
    if favorito and favorito.Usuario_id == session['usuario_id']:
        db.session.delete(favorito)
        db.session.commit()

    return redirect(url_for('meus_favoritos'))

@app.route('/saiba-mais')
def saiba_mais():
    if 'usuario_id' not in session:
        return redirect(url_for('login'))
    return render_template('saiba_mais.html')


if __name__ == '__main__':
    app.secret_key = 'sua_chave_secreta_aqui'
    app.run(debug=True)