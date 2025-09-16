from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# --------------------------------------------------------------------------
# App & DB Setup
# --------------------------------------------------------------------------
from flask import send_from_directory


app = Flask(__name__)
from flask_cors import CORS
CORS(app)
from flask import send_from_directory

# ...existing code...
@app.route('/files/<path:filename>')
def serve_file(filename):
    # Serve files from the ADMIN PANEL directory
    return send_from_directory(r'C:/Users/SHPRAMOD/Desktop/K1/ADMIN PANEL', filename)

@app.route('/api/schedules/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'error': 'Schedule not found'}), 404
    return jsonify(schedule_to_dict(schedule))
from datetime import datetime
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS

# --------------------------------------------------------------------------
# App & DB Setup
# --------------------------------------------------------------------------
from flask import send_from_directory

# ...existing code...

app = Flask(__name__)
from flask_cors import CORS
CORS(app)
from flask import send_from_directory

@app.route('/files/<path:filename>')
def serve_file(filename):
    # Serve files from the ADMIN PANEL directory
    return send_from_directory(r'C:/Users/SHPRAMOD/Desktop/K1/ADMIN PANEL', filename)
# ...existing code...
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///program.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --------------------------------------------------------------------------
# Models
# --------------------------------------------------------------------------
class Program(db.Model):
    __tablename__ = 'program'
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(255))
    created_at = db.Column(db.DateTime, default=datetime.now)
    updated_at = db.Column(db.DateTime, default=datetime.now, onupdate=datetime.now)
    weeks = db.relationship('Week', backref='program', lazy=True, cascade="all, delete-orphan")

class Week(db.Model):
    __tablename__ = 'week'
    id = db.Column(db.Integer, primary_key=True)
    program_id = db.Column(db.Integer, db.ForeignKey('program.id'), nullable=False, index=True)
    week_number = db.Column(db.Integer, nullable=False)
    modules = db.relationship('Module', backref='week', lazy=True, cascade="all, delete-orphan")
    __table_args__ = (
        db.UniqueConstraint('program_id', 'week_number', name='uq_program_week'),
    )

class Module(db.Model):
    __tablename__ = 'module'
    id = db.Column(db.Integer, primary_key=True)
    week_id = db.Column(db.Integer, db.ForeignKey('week.id'), nullable=False, index=True)
    title = db.Column(db.String(255))
    file_link = db.Column(db.Text)

    # --------------------------------------------------------------------------
    # Schedule Model
    # --------------------------------------------------------------------------
class Schedule(db.Model):
    __tablename__ = 'schedule'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(255), nullable=False, index=True)
    program_id = db.Column(db.Integer, db.ForeignKey('program.id'), nullable=False, index=True)
    start_date = db.Column(db.Date, nullable=False)
    end_date = db.Column(db.Date, nullable=False)
    is_finished = db.Column(db.Boolean, default=False, index=True)
    completed_weeks = db.Column(db.Integer, default=0)
    completed_modules = db.Column(db.Integer, default=0)
    total_weeks = db.Column(db.Integer, default=0)
    total_modules = db.Column(db.Integer, default=0)
    program = db.relationship('Program', backref='schedules')

# --------------------------------------------------------------------------
# Utilities
# --------------------------------------------------------------------------
def program_to_dict(p: Program, include_counts=True):
    return {
        'id': p.id,
        'title': p.title,
        'created_at': p.created_at.strftime('%Y-%m-%d %H:%M:%S') if p.created_at else None,
        'updated_at': p.updated_at.strftime('%Y-%m-%d %H:%M:%S') if p.updated_at else None,
        **({'weeks_count': len(p.weeks)} if include_counts else {}),
    }

def week_to_dict(w: Week, include_modules=False):
    base = {
        'id': w.id,
        'week_number': w.week_number,
    }
    if include_modules:
        base['modules'] = [module_to_dict(m) for m in w.modules]
    return base

def module_to_dict(m: Module):
    return {
        'id': m.id,
        'title': m.title,
        'file_link': m.file_link,
    }

def schedule_to_dict(s: Schedule):
    return {
        'id': s.id,
        'email': s.email,
        'program_id': s.program_id,
        'program_title': s.program.title if s.program else None,
        'start_date': s.start_date.strftime('%Y-%m-%d') if s.start_date else None,
        'end_date': s.end_date.strftime('%Y-%m-%d') if s.end_date else None,
        'is_finished': s.is_finished,
        'completed_weeks': s.completed_weeks,
        'completed_modules': s.completed_modules,
        'total_weeks': s.total_weeks,
        'total_modules': s.total_modules,
    }

# --------------------------------------------------------------------------
# Routes
# --------------------------------------------------------------------------
@app.route('/')
def home():
    return "Admin Panel API is running."

# --------------------------------------------------------------------------
# Schedule Endpoints
# --------------------------------------------------------------------------
@app.route('/api/schedules', methods=['GET'])
def get_schedules():
    schedules = Schedule.query.order_by(Schedule.start_date.asc()).all()
    return jsonify([schedule_to_dict(s) for s in schedules])
@app.route('/api/login', methods=['GET'])
def login():
    email = request.args.get('email')
    if email:
        schedules = Schedule.query.filter_by(email=email).order_by(Schedule.start_date.asc()).all()
    else:
        schedules = Schedule.query.order_by(Schedule.start_date.asc()).all()
    return jsonify([schedule_to_dict(s) for s in schedules])
@app.route('/api/schedules', methods=['POST'])
def create_schedule():
    data = request.get_json(silent=True) or {}
    email = (data.get('email') or '').strip()
    program_id = data.get('program_id')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    is_finished = bool(data.get('is_finished', False))
    if not email or not program_id or not start_date or not end_date:
        return jsonify({'message': 'Missing required fields'}), 400
    try:
        sd = datetime.strptime(start_date, '%Y-%m-%d').date()
        ed = datetime.strptime(end_date, '%Y-%m-%d').date()
    except Exception:
        return jsonify({'message': 'Invalid date format'}), 400
    program = Program.query.get(program_id)
    if not program:
        return jsonify({'message': 'Program not found'}), 404
    schedule = Schedule(email=email, program_id=program_id, start_date=sd, end_date=ed, is_finished=is_finished)
    db.session.add(schedule)
    db.session.commit()
    return jsonify({'message': 'Schedule created', 'schedule_id': schedule.id}), 201

@app.route('/api/schedules/<int:schedule_id>', methods=['PUT'])
def update_schedule(schedule_id):
    schedule = Schedule.query.get_or_404(schedule_id)
    data = request.get_json(silent=True) or {}
    email = data.get('email')
    program_id = data.get('program_id')
    start_date = data.get('start_date')
    end_date = data.get('end_date')
    is_finished = data.get('is_finished')
    if email is not None:
        schedule.email = email.strip()
    if program_id is not None:
        program = Program.query.get(program_id)
        if not program:
            return jsonify({'message': 'Program not found'}), 404
        schedule.program_id = program_id
    if start_date is not None:
        try:
            schedule.start_date = datetime.strptime(start_date, '%Y-%m-%d').date()
        except Exception:
            return jsonify({'message': 'Invalid start_date format'}), 400
    if end_date is not None:
        try:
            schedule.end_date = datetime.strptime(end_date, '%Y-%m-%d').date()
        except Exception:
            return jsonify({'message': 'Invalid end_date format'}), 400
    if is_finished is not None:
        schedule.is_finished = bool(is_finished)
    db.session.commit()
    return jsonify({'message': 'Schedule updated'})

@app.route('/api/schedules/<int:schedule_id>', methods=['DELETE'])
def delete_schedule(schedule_id):
    schedule = Schedule.query.get_or_404(schedule_id)
    db.session.delete(schedule)
    db.session.commit()
    return jsonify({'message': 'Schedule deleted'})

@app.route('/api/programs', methods=['GET'])
def get_programs():
    q = Program.query
    programs = q.order_by(Program.created_at.asc()).all()
    return jsonify([program_to_dict(p, include_counts=True) for p in programs])

@app.route('/api/programs', methods=['POST'])
def create_program():
    data = request.get_json(silent=True) or {}
    title = (data.get('title') or 'KT Program').strip()
    program = Program(title=title)
    db.session.add(program)
    db.session.commit()
    return jsonify({'message': 'Program created', 'program_id': program.id}), 201

@app.route('/api/programs/<int:program_id>/weeks', methods=['GET'])
def list_weeks(program_id):
    program = Program.query.get_or_404(program_id)
    weeks = Week.query.filter_by(program_id=program.id).order_by(Week.week_number.asc()).all()
    return jsonify([week_to_dict(w, include_modules=False) for w in weeks])

@app.route('/api/programs/<int:program_id>/weeks', methods=['POST'])
def add_week(program_id):
    data = request.get_json(silent=True) or {}
    week_number = data.get('week_number')
    if not isinstance(week_number, int) or week_number <= 0:
        return jsonify({'message': 'Invalid week_number'}), 400
    program = Program.query.get_or_404(program_id)
    existing = Week.query.filter_by(program_id=program.id, week_number=week_number).first()
    if existing:
        return jsonify({'message': f'Week {week_number} already exists for this program'}), 409
    week = Week(program_id=program.id, week_number=week_number)
    db.session.add(week)
    program.updated_at = datetime.now()
    db.session.commit()
    return jsonify({'message': 'Week added', 'week_id': week.id})

@app.route('/api/weeks/<int:week_id>/modules', methods=['GET'])
def list_week_modules(week_id):
    Week.query.get_or_404(week_id)
    modules = Module.query.filter_by(week_id=week_id).all()
    return jsonify([module_to_dict(m) for m in modules])

@app.route('/api/weeks/<int:week_id>/modules', methods=['POST'])
def add_module(week_id):
    data = request.get_json(silent=True) or {}
    title = (data.get('title') or '').strip()
    file_link = (data.get('file_link') or '').strip()
    if not title or not file_link:
        return jsonify({'message': 'title and file_link are required'}), 400
    week = Week.query.get_or_404(week_id)
    module = Module(week_id=week.id, title=title, file_link=file_link)
    db.session.add(module)
    program = Program.query.get(week.program_id)
    if program:
        program.updated_at = datetime.now()
    db.session.commit()
    return jsonify({'message': 'Module added', 'module_id': module.id})

@app.route('/api/modules/<int:module_id>', methods=['PUT'])
def edit_module(module_id):
    data = request.get_json(silent=True) or {}
    module = Module.query.get_or_404(module_id)
    new_title = data.get('title')
    new_link = data.get('file_link')
    is_finished = data.get('is_finished')
    if new_title is not None:
        module.title = new_title.strip()
    if new_link is not None:
        module.file_link = new_link.strip()
    if is_finished is not None:
        module.is_finished = bool(is_finished)
        # After updating module, check if all modules in the schedule are finished
        # Find the schedule via module -> week -> program -> schedules
        week = module.week
        program = Program.query.get(week.program_id)
        all_finished = True
        for w in program.weeks:
            for m in w.modules:
                if not getattr(m, 'is_finished', False):
                    all_finished = False
                    break
            if not all_finished:
                break
        # If all modules finished, update all related schedules
        if all_finished:
            for sched in program.schedules:
                sched.is_finished = True
    if program:
        program.updated_at = datetime.now()
    db.session.commit()
    return jsonify({'message': 'Module updated'})

@app.route('/api/modules/<int:module_id>', methods=['DELETE'])
def delete_module(module_id):
    module = Module.query.get_or_404(module_id)
    program = Program.query.get(module.week.program_id)
    if program:
        program.updated_at = datetime.now()
    db.session.delete(module)
    db.session.commit()
    return jsonify({'message': 'Module deleted'})

@app.route('/api/programs/<int:program_id>/copy', methods=['POST'])
def copy_program(program_id):
    data = request.get_json(silent=True) or {}
    new_title = (data.get('program_title') or '').strip()
    if not new_title:
        return jsonify({'message': 'Missing program_title'}), 400

    orig = Program.query.get_or_404(program_id)
    new_prog = Program(title=new_title)
    db.session.add(new_prog)
    db.session.flush()

    for week in orig.weeks:
        new_week = Week(program_id=new_prog.id, week_number=week.week_number)
        db.session.add(new_week)
        db.session.flush()
        for mod in week.modules:
            new_mod = Module(week_id=new_week.id, title=mod.title, file_link=mod.file_link)
            db.session.add(new_mod)

    db.session.commit()
    return jsonify({'message': 'Program copied', 'program_id': new_prog.id}), 201

@app.route('/api/programs/<int:program_id>', methods=['PUT'])
def edit_program(program_id):
    data = request.get_json(silent=True) or {}
    program = Program.query.get_or_404(program_id)
    new_title = data.get('title')
    if new_title is not None:
        program.title = new_title.strip()
    program.updated_at = datetime.now()
    db.session.commit()
    return jsonify({'message': 'Program updated'})

@app.route('/api/programs/<int:program_id>', methods=['DELETE'])
def delete_program(program_id):
    program = Program.query.get_or_404(program_id)
    db.session.delete(program)
    db.session.commit()
    return jsonify({'message': 'Program deleted'})
@app.route('/api/weeks/<int:week_id>', methods=['DELETE', 'OPTIONS'])
def delete_week(week_id):
    if request.method == 'OPTIONS':
        return '', 200
    week = Week.query.get_or_404(week_id)
    db.session.delete(week)
    db.session.commit()
    return jsonify({'message': 'Week deleted'})

#get schdeules by id
@app.route('/api/schedules/<int:schedule_id>', methods=['GET'])
def get_schedule(schedule_id):
    schedule = Schedule.query.get(schedule_id)
    if not schedule:
        return jsonify({'error': 'Schedule not found'}), 404
    return jsonify(schedule_to_dict(schedule))



# --------------------------------------------------------------------------
# Error Handlers
# --------------------------------------------------------------------------
@app.errorhandler(404)
def not_found(err):
    return jsonify({'message': 'Not found'}), 404

@app.errorhandler(405)
def method_not_allowed(err):
    return jsonify({'message': 'Method not allowed'}), 405

@app.errorhandler(500)
def server_error(err):
    return jsonify({'message': 'Internal server error'}), 500

# --------------------------------------------------------------------------
# Entrypoint
# --------------------------------------------------------------------------
if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(host='0.0.0.0', port=5000, debug=True)