from flask import Flask, request, jsonify
from flask_cors import CORS
from markov_system import MarkovSystem

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
    return jsonify({"status": "online", "system": "Severance Markov Backend"})

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

if __name__ == '__main__':
    print("Severance Backend Running on port 5000...")
    app.run(port=5000, debug=True)
