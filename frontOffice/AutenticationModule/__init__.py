from flask import Blueprint, flash, request, session
from flask import redirect, render_template, url_for
from forms import ClienteLoginForm, ClienteRegisterForm, ClienteEditForm, ClienteScanStore
from models import db, Cliente, bcrypt
from flask_login import login_user, logout_user, current_user
from datetime import datetime, timedelta

AutenticationClientModule = Blueprint("AutenticationClientModule", __name__)

@AutenticationClientModule.route("/")
def index():
    return redirect("/login")

@AutenticationClientModule.route("/login", methods=['GET', 'POST'])
def doLogin():
    form = ClienteLoginForm()

    if request.method == 'POST':
        if form.validate_on_submit():
            try:
                user = db.session.query(Cliente).filter(Cliente.nome == form.username_cliente.data).first()
                
                if(user == None):
                    form.username_cliente.errors.append("Nome Incorreto")
                else:
                    if(bcrypt.check_password_hash(user.password, form.password_cliente.data)):
                        login_user(user)
                        
                        return redirect('/ScanStore')
                    else:
                        form.password_cliente.errors.append("Palavra-Passe Incorreta")

            except Exception as e:
                return f'Erro ao iniciar sessão: {str(e)}'
            
    return render_template("LoginClient.html", title = "Login", formFront = form)


@AutenticationClientModule.route("/register", methods=['GET', 'POST'])
def doRegister():
    form = ClienteRegisterForm()
    if request.method == 'POST':
        user = db.session.query(Cliente).filter(Cliente.nome == form.username_cliente.data).first()
        
      
        if form.validate_on_submit() and form.register.data == True:
            encrypted_password = bcrypt.generate_password_hash(form.confirm_password.data).decode('UTF-8')
            
            if(user != None):
                l = list(form.username_cliente.errors)
                l.append("Nome já existe")
                form.username_cliente.errors = tuple(l)
                
            else:
                try:
                    new_user = Cliente(nome=form.username_cliente.data, password =  encrypted_password)

                    db.session.add(new_user)
                    db.session.commit()
                    return redirect('/login')
                
                except Exception as e:
                    return f'Erro ao criar conta: {str(e)}'
            
    return render_template("RegisterClient.html", title = "Login", formFront = form)


# fazer o scan do codigo, que não esta a permitir a leitura, possivelmente pelo tipo de codigo

@AutenticationClientModule.route("/editClient", methods=['GET', 'POST'])
def doAlteration():
    form = ClienteEditForm()

    return render_template("/client/editarPerfil.html", title = "Login", formFront = form)


@AutenticationClientModule.route("/ScanStore", methods=['GET', 'POST'])
def scanStore():
    form = ClienteScanStore()
    active_user = current_user

    if(active_user.is_authenticated):

        if request.method == 'POST':
            
            session['storeID'] = form.storeID.data
            
            return redirect('\Store')
    else:
        return redirect('\login')

    return render_template("QRcode.html", title = "Login", formFront = form)