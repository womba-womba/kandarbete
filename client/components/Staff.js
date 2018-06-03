import React from "react";
import { Switch, Icon, Button, Modal, Form, Input, Radio, DatePicker, Table, Divider, Popconfirm, Select } from 'antd';
import axios from 'axios';
import moment from 'moment';
const FormItem = Form.Item;

export default class Staff extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            staffmembers: null,
            loading: false,
            qualifications: [],
            filters: []
        };
        this.columns = [{
            title: 'Emp no',
            dataIndex: 'emp_no',
            key: 'emp_no',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.emp_no - b.emp_no,
        }, {
            title: 'First name',
            dataIndex: 'first_name',
            key: 'first_name',
            render: (text, record) => (
                <EditableCell
                    value={text}
                    onChange={this.onCellChange(record.key, 'first_name')}
                />
            ),
        }, {
            title: 'Last name',
            dataIndex: 'last_name',
            key: 'last_name',
            render: (text, record) => (
                <EditableCell
                    value={text}
                    onChange={this.onCellChange(record.key, 'last_name')}
                />
            ),
        }, {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
            render: (text, record) => (
                <EditableCell
                    value={text}
                    onChange={this.onCellChange(record.key, 'email')}
                />
            ),
        }, {
            title: 'Station',
            dataIndex: 'location',
            key: 'location',
            render: (text, record) => (
                <EditableSelect
                    type="location"
                    value={text}
                    onChange={this.onCellChange(record.key, 'location')}
                />
            ),
        }, {
            title: 'Hire date',
            dataIndex: 'hire_date',
            key: 'hire_date',
            render: (text, record) => <span>{moment(record.hire_date).format('YYYY-MM-DD')}</span>,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (text, record) => (
                <EditableSelect
                    type="status"
                    value={text}
                    onChange={this.onCellChange(record.key, 'status')}
                />
            ),
        },
        {
            title: 'Qualifications',
            dataIndex: 'qualifications',
            key: 'qualifications',
            filters: [
                { text: 'Structural Analysis Engineer', value: "1" },
                { text: 'Legal Assistant', value: "2" },
            ],
            // filters: this.state.filters,
            onFilter: (value, record) => record.qualifications.includes(value),
            render: (text, record) => (
                <EditableMultipleSelect
                    qualifications={this.state.qualifications}
                    personalQualifications={record.qualifications}
                    value={text}
                    onChange={this.onCellChange(record.key, 'qualifications')}
                />
            ),
        },
            // {
            //     title: 'Action',
            //     key: 'action',
            //     render: (text, record) => (
            //         <span>
            //             <a onClick={() => this.showOverview(record.id)}>Overview</a>
            //             <Divider type="vertical" />
            //             <a href="javascript:;">Applications</a>
            //             <Divider type="vertical" />
            //             <Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(record.id)}>
            //                 <a href="javascript:;">Delete</a>
            //             </Popconfirm>
            //         </span>
            //     ),
            // }
        ];

    }
    componentDidMount() {
        this.getStaffMembers();
    }
    getFilters() {




        // filters: [
        //     { text: 'Structural Analysis Engineer', value: 'Structural Analysis Engineer' },
        //     { text: 'Legal Assistant', value: 'Legal Assistant' },
        // ],
    }
    getStaffMembers() {
        this.setState({ loading: true });
        axios.get(`/api/getstaffmembers`)
            .then(res => {
                var staffmembers = res.data;
                for (var i = 0; i < staffmembers.length; i++) {
                    staffmembers[i].key = staffmembers[i].emp_no;
                    staffmembers[i].qualifications = [];
                }

 
                axios.get(`/api/getqualifications`)
                    .then(res => {
                        var qualifications = res.data;
                        for (var i = 0; i < qualifications.length; i++) {
                            for (var y = 0; y < staffmembers.length; y++) {
                                if (staffmembers[y].emp_no == qualifications[i].emp_no) {
                                    staffmembers[y].qualifications.push(qualifications[i].id);
                                }
                            }
                        }
                        this.setState({ staffmembers });
                    })
            })
        axios.get(`/api/getallqualifications`)
            .then(res => {
                var qualifications = res.data;
                var filters = qualifications.map((qualification) => ({ text: qualification.title, value: qualification.title }));
            filters =  [{ text: 'Legal Assistant', value: 'Legal Assistant' }];
                this.setState({ qualifications });
                this.setState({ filters })
                this.setState({ loading: false });
                

            })


    }
    showModal = () => {
        this.setState({ visible: true });
    }
    handleCancel = () => {
        this.setState({ visible: false });
    }
    handleCreate = () => {
        const form = this.formRef.props.form;
        form.validateFields((err, values) => {
            if (err) {
                return;
            }
            var qualifications = [];
            for (var i = 0; i < values['select-multiple'].length; i++) {
                for (var y = 0; y < this.state.qualifications.length; y++) {
                    if (this.state.qualifications[y].id == values['select-multiple'][i]) {
                        qualifications.push(this.state.qualifications[y].title)
                    }
                }
            }
            var valuestosend = {
                status: values['status'],
                location: values['location'],
                password: values['password'],
                emp_no: values['emp_no'],
                first_name: values['first_name'],
                last_name: values['last_name'],
                email: values['first_name'] + "." + values['last_name'] + "@sas.se",
                hire_date: moment().format('YYYY-MM-DD'),
                key: values['emp_no'],
                qualifications: qualifications,

            }
            axios.post(`/api/createuser`, valuestosend).then(res => {
                for (var i = 0; i < values['select-multiple'].length; i++) {
                    axios.post(`/api/createqualification`, { qualification: values['select-multiple'][i], emp_no: values['emp_no'] });
                }
            });
            var staffmembers = this.state.staffmembers;
            staffmembers[this.state.staffmembers.length] = valuestosend;
            form.resetFields();
            this.setState({ visible: false });
            this.setState({ staffmembers });

        });
    }
    saveFormRef = (formRef) => {
        this.formRef = formRef;
    }
    onCellChange = (key, dataIndex) => {

        return (value) => {
            const dataSource = [...this.state.staffmembers];
            const target = dataSource.find(item => item.key === key);
            if (target) {
                target[dataIndex] = value;
                this.setState({ staffmembers: dataSource });
            }
            if (dataIndex === "qualifications") {
                axios.post(`/api/editqualifications`, { emp_no: target.emp_no, qualifications: target.qualifications });

            } else {
                axios.post(`/api/editstaffmembers`, { target });
            }

        };
    }

    // onDelete = (key) => {
    //     const dataSource = [...this.state.vacationperiods];
    //     axios.post(`/api/deletestaffmember`, { id: key })
    //         .then(res => { });
    //     this.setState({ vacationperiods: dataSource.filter(item => item.id !== key) });
    // }

    render() {
        return (
            <div>
                <div>
                    <Button className="editable-add-btn" type="primary" onClick={this.showModal}>Create new staff member</Button>
                    <CollectionCreateForm
                        wrappedComponentRef={this.saveFormRef}
                        visible={this.state.visible}
                        onCancel={this.handleCancel}
                        onCreate={this.handleCreate}
                        staff={this.state.staffmembers}
                    />
                    <Table loading={this.state.loading} columns={this.columns} dataSource={this.state.staffmembers} />
                </div>
            </div>

        );
    }

}
const CollectionCreateForm = Form.create()(
    class extends React.Component {
        state = {
            confirmDirty: false,
            qualifications: null
        };
        compareToFirstPassword = (rule, value, callback) => {
            const form = this.props.form;
            if (value && value !== form.getFieldValue('password')) {
                callback('Two passwords that you enter is inconsistent!');
            } else {
                callback();
            }
        }
        validateToNextPassword = (rule, value, callback) => {
            const form = this.props.form;
            if (value && this.state.confirmDirty) {
                form.validateFields(['confirm'], { force: true });
            }
            callback();
        }
        validateEmployeeNo = (rule, value, callback) => {

            const form = this.props.form;
            var exists = false;
            for (var i = 0; i < this.props.staff.length; i++) {
                if (this.props.staff[i].emp_no == value) {
                    exists = true;
                }
            }
            if (exists) {
                callback('Employee no already exists!');
            } else {
                callback();
            }
        }
        handleConfirmBlur = (e) => {
            const value = e.target.value;
            this.setState({ confirmDirty: this.state.confirmDirty || !!value });
        }
        componentDidMount() {
            this.itirateOptions();
        }
        itirateOptions() {
            var qualifications = [];
            axios.get(`/api/getallqualifications`)
                .then(res => {
                    for (var i = 0; i < res.data.length; i++) {
                        qualifications.push(<Select.Option key={res.data[i].id} >{res.data[i].title}</Select.Option>)
                    }
                    this.setState({ qualifications });
                })

        }
        render() {
            const { visible, onCancel, onCreate, form } = this.props;
            const { getFieldDecorator } = form;
            return (
                <Modal
                    visible={visible}
                    title="Create a new staff member"
                    okText="Create"
                    onCancel={onCancel}
                    onOk={onCreate}
                >
                    <Form layout="vertical">
                        <FormItem label="Employee no">
                            {getFieldDecorator('emp_no', {
                                rules: [{ required: true, message: 'Please input an employee no' },
                                { validator: this.validateEmployeeNo }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label="Password">
                            {getFieldDecorator('password', {
                                rules: [{ required: true, message: 'Please input a password' },
                                { validator: this.validateToNextPassword }],
                            })(
                                <Input type="password" />
                            )}
                        </FormItem>
                        <FormItem label="Confirm password">
                            {getFieldDecorator('confirmpassword', {
                                rules: [{ required: true, message: 'Please confirm the password' },
                                { validator: this.compareToFirstPassword }],
                            })(
                                <Input type="password" onBlur={this.handleConfirmBlur} />
                            )}
                        </FormItem>
                        <FormItem label="First name">
                            {getFieldDecorator('first_name', {
                                rules: [{ required: true, message: 'Please input a first name' }],
                            })(
                                <Input />
                            )}
                        </FormItem>
                        <FormItem label="Last name">
                            {getFieldDecorator('last_name', {
                                rules: [{ required: true, message: 'Please input a last name' }],
                            })(
                                <Input />
                            )}
                        </FormItem>

                        <FormItem label="Location">
                            {getFieldDecorator('location', {
                                initialValue: 'Stockholm',
                            })(
                                <Radio.Group>
                                    <Radio value="Stockholm">Stockholm</Radio>
                                    <Radio value="Oslo">Oslo</Radio>
                                    <Radio value="Copenhagen">Copenhagen</Radio>
                                </Radio.Group>
                            )}
                        </FormItem >
                        <FormItem label="Status">
                            {getFieldDecorator('status', {
                                initialValue: 1,
                            })(
                                <Radio.Group>
                                    <Radio value={1}>Staff</Radio>
                                    <Radio value={2}>Admin</Radio>
                                </Radio.Group>
                            )}
                        </FormItem>
                        <FormItem
                            label="Select qualification"
                        >
                            {getFieldDecorator('select-multiple', {
                                rules: [
                                    { required: true, message: 'Please select a qualification', type: 'array' },
                                ],
                            })(
                                <Select mode="multiple">
                                    {this.state.qualifications}
                                </Select>
                            )}
                        </FormItem>


                    </Form>
                </Modal>
            );
        }
    }
);


class EditableCell extends React.Component {
    state = {
        value: this.props.value,
        editable: false,
    }
    handleChange = (e) => {
        const value = e.target.value;
        this.setState({ value });
    }
    check = () => {
        this.setState({ editable: false });
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    }
    edit = () => {
        this.setState({ editable: true });
    }
    render() {
        const { value, editable } = this.state;
        return (
            <div className="editable-cell">
                {
                    editable ?
                        <div className="editable-cell-input-wrapper">
                            <Input
                                value={value}
                                onChange={this.handleChange}
                                onPressEnter={this.check}
                            />
                            <Icon
                                type="check"
                                className="editable-cell-icon-check"
                                onClick={this.check}
                            />
                        </div>
                        :
                        <div className="editable-cell-text-wrapper">
                            {value || ' '}
                            <Icon
                                type="edit"
                                className="editable-cell-icon"
                                onClick={this.edit}
                            />
                        </div>
                }
            </div>
        );
    }
}
class EditableSelect extends React.Component {
    state = {
        value: this.props.value,
        editable: false,
    }
    handleChange = (e) => {
        const value = e;
        this.setState({ value });
    }
    check = () => {
        this.setState({ editable: false });
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    }
    edit = () => {
        this.setState({ editable: true });
    }
    render() {
        const { value, editable } = this.state;
        return (
            <div className="editable-cell">
                {
                    editable ?
                        <div className="editable-cell-input-wrapper">
                            {this.props.type === "location" &&
                                <Select value={value} style={{ width: 140 }} onChange={this.handleChange}>


                                    <Select.Option value="Stockholm">Stockholm</Select.Option>
                                    <Select.Option value="Oslo">Oslo</Select.Option>
                                    <Select.Option value="Copenhagen">Copenhagen</Select.Option>


                                </Select>
                            }
                            {this.props.type === "status" &&
                                <Select value={value} style={{ width: 100 }} onChange={this.handleChange}>

                                    <Select.Option value={1} >Staff</Select.Option>
                                    <Select.Option value={2} >Admin</Select.Option>


                                </Select>
                            }
                            <Icon
                                type="check"
                                className="editable-cell-icon-check"
                                onClick={this.check}
                            />
                        </div>
                        :
                        <div className="editable-cell-text-wrapper">
                            {value == 1 && 'Staff'}
                            {value == 2 && 'Admin'}
                            {typeof value === "string" && value}
                            <Icon
                                type="edit"
                                className="editable-cell-icon"
                                onClick={this.edit}
                            />
                        </div>
                }
            </div>
        );
    }
}
class EditableMultipleSelect extends React.Component {
    state = {
        value: this.props.value,
        options: [],
        editable: false,
    }
    handleChange = (e) => {

        const value = e;
        this.setState({ value });
    }
    check = () => {
        this.setState({ editable: false });
        if (this.props.onChange) {
            this.props.onChange(this.state.value);
        }
    }
    edit = () => {
        this.setState({ editable: true });
    }
    render() {
        const { value, editable } = this.state;

        return (
            <div className="editable-cell">
                {
                    editable ?
                        <div className="editable-cell-input-wrapper">
                            <Select style={{ width: 150 }} mode="multiple" value={value.map((value) => String(value))} onChange={this.handleChange}>
                                {this.props.qualifications.map((element) =>
                                    <Select.Option key={String(element.id)} >{element.title}</Select.Option>
                                )}
                            </Select>

                            <Icon
                                type="check"
                                className="editable-cell-icon-check"
                                onClick={this.check}
                            />
                        </div>
                        :
                        <div className="editable-cell-text-wrapper">
                            {value.map((id) => this.props.qualifications.find(item => item.id === parseInt(id)).title + ", ")}
                            <Icon
                                type="edit"
                                className="editable-cell-icon"
                                onClick={this.edit}
                            />
                        </div>
                }
            </div>
        );
    }
}
// {record.status === 1 && 'Staff'}{record.status === 2 && 'Admin'}