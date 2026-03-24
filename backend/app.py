from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from markov_system import MarkovSystem
import io
import zipfile
import json
import numpy as np

app = Flask(__name__)
# 允许前端跨域访问
CORS(app)

def build_system_from_json(data):
    """根据前端传入的JSON构建MarkovSystem实例"""
    system = MarkovSystem()
    
    # 1. Add Events
    for node in data.get('nodes', []):
        # Frontend nodes look like { id: '...', data: { label: '...' } }
        # Or simplified
        eid = node.get('id')
        name = node.get('data', {}).get('label', eid)
        system.add_event(eid, name)
        
    # 2. Add Transitions
    for edge in data.get('edges', []):
        # Frontend edges { id: '...', source: '...', target: '...', data: { probability: ... } }
        tid = edge.get('id')
        fid = edge.get('source')
        to_id = edge.get('target')
        prob = edge.get('data', {}).get('probability', 0.5)
        
        # 只有当关联的节点都存在时才添加 (Robustness)
        if fid in system.events and to_id in system.events:
            system.add_transition(tid, fid, to_id, prob)
            
    return system

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "online", "system": "Markov System Backend"})

@app.route('/validate', methods=['POST'])
def validate():
    data = request.json
    try:
        system = build_system_from_json(data)
        errors = system.validate()
        return jsonify({"valid": len(errors) == 0, "errors": errors})
    except Exception as e:
        return jsonify({"valid": False, "errors": [str(e)]}), 400

@app.route('/simulate', methods=['POST'])
def simulate():
    data = request.json
    steps = data.get('steps', 20)
    
    try:
        system = build_system_from_json(data)
        
        # 验证系统后再模拟
        validation_errors = system.validate()
        if validation_errors:
             return jsonify({
                 "error": "System invalid", 
                 "validation_errors": validation_errors
             }), 400
             
        # 获取矩阵信息以便前端显示
        ids, matrix = system.get_transition_matrix()
        
        # 运行模拟
        sim_steps, distributions = system.simulate(steps)
        
        return jsonify({
            "matrix": {
                "ids": ids,
                "values": matrix.tolist() # numpy array to list
            },
            "simulation": {
                "steps": sim_steps,
                "distributions": distributions
            }
        })
    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

@app.route('/export', methods=['POST'])
def export_system():
    data = request.json
    try:
        system = build_system_from_json(data)
        ids, matrix = system.get_transition_matrix()
        
        # Determine names
        id_to_name = {eid: ev.name for eid, ev in system.events.items()}
        names = [id_to_name.get(x, x) for x in ids]
        
        # Create ZIP in memory
        memory_file = io.BytesIO()
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            
            # 1. graph.json (Raw structure for reloading/standard format)
            # Re-serialize the request data or build a clean graph format
            graph_data = {
                "nodes": data.get('nodes', []),
                "edges": data.get('edges', [])
            }
            zf.writestr('graph.json', json.dumps(graph_data, indent=2))
            
            # 2. matrix.txt (Human readable text)
            # Format: Header row with names, then rows with Name + probs
            matrix_str = "S \\ S', " + ", ".join(names) + "\n"
            for i, row_name in enumerate(names):
                row_vals = ", ".join([f"{x:.4f}" for x in matrix[i]])
                matrix_str += f"{row_name}, {row_vals}\n"
            zf.writestr('transition_matrix.csv', matrix_str)
            
            # 3. matrix.npy (Numpy binary format)
            # Use a temporary buffer for numpy save
            np_buffer = io.BytesIO()
            np.save(np_buffer, matrix)
            zf.writestr('transition_matrix.npy', np_buffer.getvalue())
            
        memory_file.seek(0)
        return send_file(
            memory_file,
            mimetype='application/zip',
            as_attachment=True,
            download_name='markov_system_export.zip'
        )

    except Exception as e:
        print(e)
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    print("Markov System Backend Running on port 5001...")
    app.run(port=5001, debug=True)
