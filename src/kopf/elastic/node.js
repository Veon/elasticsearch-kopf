function Node(node_id, node_info, node_stats) {
	this.id = node_id;	
	this.name = node_info.name;
	this.metadata = {};
	this.metadata.info = node_info;
	this.metadata.stats = node_stats;
	this.transport_address = node_info.transport_address;
	var master = node_info.attributes.master === 'false' ? false : true;
	var data = node_info.attributes.data === 'false' ? false : true;
	var client = node_info.attributes.client === 'true' ? true : false;
	this.master =  master && !client;
	this.data = data && !client;
	this.client = client || !master && !data;
	this.current_master = false;
	this.stats = node_stats;
	
	// FIXME: 0.90/1.0 check
	this.heap_used = readablizeBytes(getProperty(this.stats,'jvm.mem.heap_used_in_bytes'));
	this.heap_committed = readablizeBytes(getProperty(this.stats, 'jvm.mem.heap_committed_in_bytes'));

	this.setCurrentMaster=function() {
		this.current_master = true;
	};

	this.equals=function(node) {
		return node.id === this.id;
	};
	
	this.compare=function(other) {
		if (other.current_master) return 1; // current master comes first
		if (other.master && !this.master) return 1; // master eligible comes first
		if (other.data && !this.data) return 1; // data node comes first
		if (this.current_master) return -1; // current master comes first
		if (this.master && !other.master) return -1; // master eligible comes first
		if (this.data && !other.data) return -1; // data node comes first
		return this.name.localeCompare(other.name); // if all the same, lex. sort
	};
	
	this.matches=function(name, data, master, client) {
		if (notEmpty(name)) {
			if (this.name.toLowerCase().indexOf(name.trim().toLowerCase()) == -1) {
				return false;
			}
		}
		return (data && this.data || master && this.master || client && this.client);
	};
}