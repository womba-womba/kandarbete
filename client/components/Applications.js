import React from "react";
import { Badge, Switch, Icon, Button, Modal, Form, Input, Radio, DatePicker, Table, Divider, Popconfirm } from 'antd';
import axios from 'axios';
import moment from 'moment';
const FormItem = Form.Item;

export default class Applications extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            applications: null,
            staffmembers: null,
            staffmemberswithvacation: null,
            periodID: null,
            loading: false,
            searchText: '',
            filterDropdownVisible: false,
            filtered: false,
            filters: []
        };
    }
    verifyStatus(record) {
        var vacation1 = null;
        var vacation2 = null;
        var vacation3 = null;
        var v1 = 0;
        var v2 = 0;
        var v3 = 0;
        if (record.applications.find(application => (application.vacation_no == 1 && application.status == 0))) {
            vacation1 = <Badge status="default" />
            v1++
        }
        if (record.applications.find(application => (application.vacation_no == 1 && application.status == 1))) {
            vacation1 = <Badge status="error" />
            v1++
        }
        if (record.applications.find(application => (application.vacation_no == 1 && application.status == 2))) {
            vacation1 = <Badge status="success" />
            v1++
        }
        if (record.applications.find(application => (application.vacation_no == 2 && application.status == 0))) {
            vacation2 = <Badge status="default" />
            v2++
        }
        if (record.applications.find(application => (application.vacation_no == 2 && application.status == 1))) {
            vacation2 = <Badge status="error" />
            v2++
        }
        if (record.applications.find(application => (application.vacation_no == 2 && application.status == 2))) {
            vacation2 = <Badge status="success" />
            v2++
        }
        if (record.applications.find(application => (application.vacation_no == 3 && application.status == 0))) {
            vacation3 = <Badge status="default" />
            v3++
        }
        if (record.applications.find(application => (application.vacation_no == 3 && application.status == 1))) {
            vacation3 = <Badge status="error" />
            v3++
        }
        if (record.applications.find(application => (application.vacation_no == 3 && application.status == 2))) {
            vacation3 = <Badge status="success" />
            v3++
        }
        if (v1 > 1) {
            vacation1 = <Badge status="warning" />
        }
        if (v2 > 1) {
            vacation2 = <Badge status="warning" />
        }
        if (v3 > 1) {
            vacation3 = <Badge status="warning" />
        }

        return <span>{vacation1}{vacation2}{vacation3}</span>;
    }
    onInputChange = (e) => {
        this.setState({ searchText: e.target.value });
    }
    onSearch = () => {
        const { searchText } = this.state;
        const reg = new RegExp(searchText, 'gi');
        this.setState({
            filterDropdownVisible: false,
            filtered: !!searchText,
            staffmemberswithvacation: this.state.staffmemberswithvacation.map((record) => {
                console.log(record.first_name)
                const match = record.first_name.match(reg);
                if (!match) {
                    return null;
                }
                return {
                    ...record,
                    first_name: (
                        <span>
                            {record.first_name.split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i')).map((text, i) => (
                                text.toLowerCase() === searchText.toLowerCase() ?
                                    <span key={i} className="highlight">{text}</span> : text // eslint-disable-line
                            ))}
                        </span>
                    ),
                };
            }).filter(record => !!record),
        });
    }
    componentDidMount() {
        this.initiailizePeriod();
        this.getApplications();
        this.getQualifications();
    }
    initiailizePeriod() {
        var periodID = null;
        if (this.props.vacationperiod !== undefined) {
            periodID = this.props.vacationperiod.key;
            this.setState({ periodID });
        }
        else {
            this.columns.unshift(
                {
                    title: 'Period',
                    width: 130,
                    dataIndex: 'name',
                    key: 'name',

                }
            )
        }
    }
    confirmApplication(record) {
        var dataSource = [...this.state.staffmemberswithvacation];
        var employeeID = dataSource.findIndex((employee) => employee.emp_no === record.emp_no && employee.name === record.name);
        dataSource[employeeID].applications.forEach((application) => {
            if (application.vacation_no == record.vacation_no &&
                application.key != record.key
            ) {
                application.status = 1
                axios.post(`/api/editvacation`, { id: application.key, status: 1 })
            }
            if (application.key == record.key) {
                application.status = 2
                axios.post(`/api/editvacation`, { id: record.key, status: 2 })
            }
        })
        this.setState({ staffmemberswithvacation: dataSource });
    }
    denyApplication(record) {
        var dataSource = [...this.state.staffmemberswithvacation];
        var employeeID = dataSource.findIndex((employee) => employee.emp_no === record.emp_no && employee.name === record.name);
        dataSource[employeeID].applications.forEach((application) => {
            if (application.key == record.key) {
                application.status = 1
                axios.post(`/api/editvacation`, { id: record.key, status: 1 })
            }
        })

        this.setState({ staffmemberswithvacation: dataSource });
    }

    onDelete = (record) => {
        var dataSource = [...this.state.staffmemberswithvacation];
        var employeeID = dataSource.findIndex((employee) => employee.emp_no === record.emp_no && employee.name === record.name);
        dataSource[employeeID].applications = dataSource[employeeID].applications.filter(item => item.key !== record.key);
        axios.post(`/api/deletevacation`, { id: record.key })
        this.setState({ staffmemberswithvacation: dataSource });
    }
    getQualifications() {
        axios.get(`/api/getallqualifications`)
            .then(res => {
                var qualifications = res.data;
                var filters = qualifications.map((qualification) => ({ text: qualification.title, value: qualification.id }));
                this.setState({ qualifications });
                this.setState({ filters })


            })
    }
    getApplications() {
        this.setState({ loading: true });
        axios.get(`/api/getstaffmembers`)
            .then(res => {
                var staffmembers = res.data;
                var staffmemberswithvacation = [];
                for (var i = 0; i < staffmembers.length; i++) {
                    staffmembers[i].key = staffmembers[i].emp_no;
                    staffmembers[i].qualifications = [];
                    staffmembers[i].applications = [];
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
                        axios.get(`/api/getapplications`, { params: { period: this.state.periodID } })
                            .then(res => {
                                var applications = res.data;
                                for (var i = 0; i < applications.length; i++) {

                                    applications[i].key = applications[i].id;
                                    applications[i].start_date = moment(applications[i].start_date).format('YYYY-MM-DD');
                                    applications[i].end_date = moment(applications[i].end_date).format('YYYY-MM-DD');
                                    var notfound = true;
                                    for (var y = 0; y < staffmemberswithvacation.length; y++) {
                                        if (applications[i].emp_no === 2) {
                                            // console.log(" - ");
                                            // console.log(applications[i].emp_no);
                                            // console.log(staffmemberswithvacation[y].emp_no);
                                            // console.log(applications[i].name);
                                            // console.log(staffmemberswithvacation[y].name);
                                            // console.log(" + ");
                                        }
                                        if (
                                            staffmemberswithvacation[y].emp_no === applications[i].emp_no &&
                                            staffmemberswithvacation[y].name === applications[i].name
                                        ) {
                                            staffmemberswithvacation[y].applications.push(applications[i]);
                                            notfound = false;
                                            if (applications[i].emp_no === 2) {
                                                // console.log(notfound);
                                                // console.log(" / ");
                                            }
                                        }
                                    }
                                    if (notfound) {
                                        for (var y = 0; y < staffmembers.length; y++) {
                                            if (
                                                staffmembers[y].emp_no === applications[i].emp_no
                                            ) {

                                                staffmembers[y].created = moment(applications[i].created).format('YYYY-MM-DD');
                                                staffmembers[y].name = applications[i].name;
                                                staffmembers[y].applications.push(applications[i]);
                                                staffmemberswithvacation.push(staffmembers[y]);
                                            }
                                        }
                                    }
                                    // if (applications[i].emp_no === 2 || applications[i].emp_no === 3){
                                    //     console.log(applications[i].emp_no);
                                    //     console.log(applications[i].name);
                                    //     console.log("a");

                                    // }
                                    // var staffmemberwithvacationID = staffmemberswithvacation.findIndex((staffmember) => (staffmember.emp_no === applications[i].emp_no && staffmember.name === applications[i].name));
                                    // if (staffmemberwithvacationID === -1) {
                                    //     var staffmemberID = staffmembers.findIndex((staffmember) => staffmember.emp_no === applications[i].emp_no);
                                    //     staffmembers[staffmemberID].created = moment(applications[i].created).format('YYYY-MM-DD');
                                    //     staffmembers[staffmemberID].name = applications[i].name;
                                    //     staffmembers[staffmemberID].applications.push(applications[i]);
                                    //     staffmemberswithvacation.push(staffmembers[staffmemberID]);
                                    // } else {
                                    //     if (applications[i].emp_no === 2 || applications[i].emp_no === 3){
                                    //         console.log(staffmemberswithvacation[staffmemberwithvacationID]);
                                    //         console.log("b");

                                    //     }
                                    //     staffmemberswithvacation[staffmemberwithvacationID].applications.push(applications[i]);
                                    // };

                                }

                                this.setState({ applications });
                                this.setState({ staffmembers });
                                this.setState({ staffmemberswithvacation });
                                this.setState({ loading: false });

                            })

                    })
            })
    }

    onCellChange = (key, dataIndex) => {

        return (value) => {
            const dataSource = [...this.state.applications];
            const target = dataSource.find(item => item.key === key);
            if (target) {
                target[dataIndex] = value;
                this.setState({ staffmembers: dataSource });
            }
            axios.post(`/api/editvacation`, { start_date: target.start_date, end_date: target.end_date, id: target.key });
        };
    }

    expandedRowRender = (record) => {
        const columns = [
            {
                title: 'Vacation no',
                dataIndex: 'vacation_no',
                key: 'vacation_no',
                render: (value, row, index) => {
                    const obj = {
                        children: value,
                        props: {},
                    };
                    if (record.applications.findIndex(application => application.vacation_no == value) == index) {
                        var vacationno_vacations = record.applications.filter(application => application.vacation_no == value);
                        obj.props.rowSpan = vacationno_vacations.length;
                    }
                    else {
                        obj.props.rowSpan = 0;
                    }

                    return obj;
                },
            },
            {
                title: 'Choice no',
                dataIndex: 'choice_no',
                key: 'choice_no',
            },
            {
                title: 'Start date',
                dataIndex: 'start_date',
                key: 'start_date',

                render: (text, record) => <EditableCell
                    value={record.start_date}
                    onChange={this.onCellChange(record.key, 'start_date')}
                />,
            }, {
                title: 'End date',
                dataIndex: 'end_date',
                key: 'end_date',
                render: (text, record) => <EditableCell
                    value={record.end_date}
                    onChange={this.onCellChange(record.key, 'end_date')}
                />,
            },

            {
                title: 'Status',
                dataIndex: 'status',
                key: 'status',
                render: (text, record) => <span>{record.status === 0 && 'Not reviewed'}
                    {record.status === 1 && 'Denied'}
                    {record.status === 2 && 'Accepted'}</span>,
            },
            {
                title: 'Description',
                dataIndex: 'description',
                key: 'description',
                render: (value, row, index) => {
                    const obj = {
                        children: value,
                        props: {},
                    };
                    if (record.applications.findIndex(application => application.vacation_no == row.vacation_no) == index) {
                        var vacationno_vacations = record.applications.filter(application => application.vacation_no == row.vacation_no);
                        obj.props.rowSpan = vacationno_vacations.length;
                    }
                    else {
                        obj.props.rowSpan = 0;
                    }

                    return obj;
                },
            },

            {
                title: 'Action',
                key: 'action',
                render: (text, record) => (
                    <span>
                        <a onClick={() => this.confirmApplication(record)}>Confirm</a>
                        <Divider type="vertical" />
                        <a onClick={() => this.denyApplication(record)}>Deny</a>
                        <Divider type="vertical" />
                        <Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(record)}>
                            <a href="javascript:;">Delete</a>
                        </Popconfirm>
                    </span>
                ),
            }
        ];
        return (
            <Table
                columns={columns}
                dataSource={record.applications}
                pagination={false}
            />
        );
    };
    render() {
        const columns = [{
            title: 'Emp no',
            width: 140,
            dataIndex: 'emp_no',
            key: 'emp_no',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.emp_no - b.emp_no,

        },
        {
            title: 'First name',
            dataIndex: 'first_name',
            key: 'first_name',
            width: 130,
            sorter: (a, b) => { return a.first_name.localeCompare(b.first_name) },
            filterDropdown: (
                <div className="custom-filter-dropdown">
                    <Input
                        ref={ele => this.searchInput = ele}
                        placeholder="Search name"
                        value={this.state.searchText}
                        onChange={this.onInputChange}
                        onPressEnter={this.onSearch}
                    />
                    <Button type="primary" onClick={this.onSearch}>Search</Button>
                </div>
            ),
            filterIcon: <Icon type="search" style={{ color: this.state.filtered ? '#108ee9' : '#aaa' }} />,
            filterDropdownVisible: this.state.filterDropdownVisible,
            onFilterDropdownVisibleChange: (visible) => {
                this.setState({
                    filterDropdownVisible: visible,
                }, () => this.searchInput && this.searchInput.focus());
            },
        }, {
            title: 'Last name',
            dataIndex: 'last_name',
            key: 'last_name',
            width: 120,
            sorter: (a, b) => { return a.last_name.localeCompare(b.last_name) },
        }, {
            title: 'Hire date',
            dataIndex: 'hire_date',
            key: 'hire_date',
            width: 120,
            sorter: (a, b) => a.hire_date - b.hire_date,
            render: (text, record) => <span>{moment(record.hire_date).format('YYYY-MM-DD')}</span>,
        },
        {
            title: 'Created',
            dataIndex: 'created',
            key: 'created',
            width: 120,
            render: (text, record) => <span>{moment(record.created).format('YYYY-MM-DD')}</span>,

        }, {
            title: 'Status',
            key: 'status',
            width: 120,
            render: (text, record) => this.verifyStatus(record),
        },
        {
            title: 'Qualifications',
            dataIndex: 'qualifications',
            key: 'qualifications',
            // filters: [
            //     { text: 'Structural Analysis Engineer', value: 1 },
            //     { text: 'Legal Assistant', value: 2 },
            //     { text: 'Professor', value: 3 },
            //     { text: 'Physical Therapy Assistant', value: 4 },
            //     { text: 'Assistant Professor', value: 5 },
            //     { text: 'VP Sales', value: 6 },
            //     { text: 'Senior Financial Analyst', value: 7 },
            //     { text: 'GIS Technical Architect', value: 8 },
            //     { text: 'Staff Scientist', value: 9 },
            //     { text: 'Data Coordiator', value: 10 },
            //     { text: 'Nurse', value: 11 },
            //     { text: 'Automation Specialist II', value: 12 },
            //     { text: 'Human Resources Assistant III', value: 13 },
            //     { text: 'Assistant Professor', value: 14 },
            //     { text: 'Recruiting Manager', value: 15 },
            //     { text: 'Social Worker', value: 16 },
            //     { text: 'Web Developer II', value: 17 },
            //     { text: 'Cost Accountant', value: 18 },
            //     { text: 'GIS Technical Architect', value: 19 },
            //     { text: 'Help Desk Technician', value: 20 },

            // ],
            filters: this.state.filters,
            onFilter: (value, record) => record.qualifications.includes(parseInt(value)),
            render: (text, record) => <span>{text.map((id) => this.state.qualifications.find(item => item.id === parseInt(id)).title + ", ")}</span>,
        },

            // {
            //     title: 'Action',
            //     key: 'action',
            //     render: (text, record) => (
            //         <span>
            //             <a onClick={() => this.confirmApplication(record)}>Confirm</a>
            //             <Divider type="vertical" />
            //             <a onClick={() => this.denyApplication(record)}>Deny</a>
            //             <Divider type="vertical" />
            //             <Popconfirm title="Sure to delete?" onConfirm={() => this.onDelete(record.key)}>
            //                 <a href="javascript:;">Delete</a>
            //             </Popconfirm>
            //         </span>
            //     ),
            // }
        ];
        return (
            <Table scroll={{ y: 650 }} loading={this.state.loading} expandedRowRender={this.expandedRowRender} columns={columns} dataSource={this.state.staffmemberswithvacation} />
        );
    }

}
class EditableCell extends React.Component {
    state = {
        value: this.props.value,
        editable: false,
    }
    handleChange = (e, d) => {
        const value = e.format('YYYY-MM-DD');
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
                            <DatePicker value={moment(value)} onChange={this.handleChange} format='YYYY-MM-DD' />
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
