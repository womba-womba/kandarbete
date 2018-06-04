import React from "react";
import { Switch, Icon, Button, Modal, Form, Input, Radio, DatePicker, Table, Divider, Popconfirm } from 'antd';
import axios from 'axios';
import Moment from 'moment';
import { extendMoment } from 'moment-range';
// import { AgGridReact } from 'ag-grid-react';
// import 'ag-grid/dist/styles/ag-grid.css';
// import 'ag-grid/dist/styles/ag-theme-balham.css';

const moment = extendMoment(Moment);
const FormItem = Form.Item;

export default class Overview extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            vacations: null,
            columns: null,
            loading: false,

        };
        this.optimize = this.optimize.bind(this);
    }
    createColumns() {
        var columns = [];
        const emp_no = {
            title: 'Emp no',
            dataIndex: 'emp_no',
            key: 'emp_no',
            fixed: 'left',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.emp_no - b.emp_no,
            // render: (value, row, index) => {
            //     const obj = {
            //       children: value,
            //       props: {},
            //     };
            //     if (index === 2) {
            //       obj.props.rowSpan = 2;
            //     }
            //     // These two are merged into above cell
            //     if (index === 3) {
            //       obj.props.rowSpan = 0;
            //     }
            //     if (index === 4) {
            //       obj.props.colSpan = 0;
            //     }
            //     return obj;
            //   },
        }
        const vacation_no = {
            title: 'Vac no',
            dataIndex: 'vacation_no',
            key: 'vacation_no',
            fixed: 'left',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.vacation_no - b.vacation_no,
        }
        const choice_no = {
            title: 'Ch no',
            dataIndex: 'choice_no',
            key: 'choice_no',
            fixed: 'left',
            defaultSortOrder: 'descend',
            sorter: (a, b) => a.choice_no - b.choice_no,
        }
        const action = {
            title: 'Action',
            dataIndex: 'action',
            key: 'action',
            fixed: 'left',
            render: (text, record) => (
                <span>
                    <a onClick={() => this.confirmApplication(record)}>Accept</a>
                    <Divider type="vertical" />
                    <a onClick={() => this.denyApplication(record)}>Deny</a>
                    <Divider type="vertical" />
                    <Popconfirm title="Sure to delete?" >
                        <a href="javascript:;">Delete</a>
                    </Popconfirm>
                </span>
            ),
        }
        columns.push(emp_no);
        columns.push(vacation_no);
        columns.push(choice_no);
        columns.push(action);
        const range = moment.range(moment(this.props.vacationperiod.start_date).format('YYYY-MM-DD'), moment(this.props.vacationperiod.end_date).format('YYYY-MM-DD'));
        const months = Array.from(range.by('months'));
        const days = Array.from(range.by('days'));
        var daysarray = [];
        var monthsarray = [];
        // const weeks = Array.from(range.by('weeks'));
        var weeksarray = [];
        for (var i = 0; i < months.length; i++) {
            monthsarray[i] = {
                title: months[i].format('MMM'),
                dataIndex: months[i].format('YYYY/MM'),
                key: months[i].format('YYYY/MM'),
                children: []
            }
        }


        for (var i = 0; i < days.length; i++) {
            // console.log(days[i].format('YYYY-MM-DD'));
            // console.log(days[i].format('W'));
            daysarray[i] = {
                title: days[i].format('DD'),
                dataIndex: days[i].format('YYYY/MM/DD'),
                key: days[i].format('YYYY/MM/DD'),
                onHeaderCell: (column) => ({

                }),
                children: [{
                    title: days[i].format("ddd"),
                    dataIndex: days[i].format('YYYY-MM-DD'),
                    key: days[i].format('YYYY-MM-DD'),
                    onHeaderCell: (column) => ({
                        className: "test",
                    }),
                    render: (text, record) => <span className=
                        {(text === true && record.status == 0) ? "applied" :
                            (text === true && record.status == 1) ? "accepted" :
                                (text === true && record.status == 2) ? "denied" :
                                    text > 5 ? "booked" : null}>
                        {record.key === "quotas" ? text + "/5" : null}</span>,
                    // onCell: (record) =>  ({
                    //     className: "test",
                    //   }),

                }]

            }
            for (var y = 0; y < monthsarray.length; y++) {
                if (days[i].format('MMM') === monthsarray[y].title) {
                    var found = 0;
                    for (var z = 0; z < monthsarray[y].children.length; z++) {
                        if (days[i].format('W') === monthsarray[y].children[z].title) {
                            found = 1;
                            monthsarray[y].children[z].children.push(daysarray[i]);
                        }
                    }
                    if (found == 0) {
                        monthsarray[y].children.push({
                            title: days[i].format('W'),
                            dataIndex: days[i].format('YYYY/MMM/W'),
                            key: days[i].format('YYYY/MMM/W'),
                            children: [daysarray[i]]
                        }
                        )
                    }
                }
            }

        }
        for (var i = 0; i < monthsarray.length; i++) {
            columns.push(monthsarray[i]);
        }

        this.setState({ columns });
    }

    componentDidMount() {
        this.createColumns();
        this.getVacations();

    }
    confirmApplication(record) {
        var dataSource = [...this.state.vacations];
        for (var i = 0; i < dataSource.length; i++) {
            if (dataSource[i].vacation_no == record.vacation_no &&
                dataSource[i].emp_no == record.emp_no &&
                dataSource[i].key != record.key
            ) {
                if (dataSource[i].status == 0) {

                    dataSource[i].status = 2;
                }
            }
            if (
                dataSource[i].key == record.key
            ) {
                if (dataSource[i].status == 0) {
                    dataSource[i].status = 1;
                    for (var key in dataSource[i]) {
                        if (dataSource[i][key] === true) {
                            dataSource[0][key]++;
                        }
                    }
                }

            }
        }
        this.setState({ vacations: dataSource });


    }
    denyApplication(record) {
        var dataSource = [...this.state.vacations];
        var applicationIndex = dataSource.findIndex(item => item.key === record.key);
        if (dataSource[applicationIndex].status == 0) {
            dataSource[applicationIndex].status = 2;
        }
        this.setState({ vacations: dataSource });

    }
    onDelete = (key) => {

    }
    getVacations() {
        this.setState({ loading: true });
        axios.get(`/api/getvacations`, { params: { period: this.props.vacationperiod.key } })
            .then(res => {
                var vacations = res.data;
                var range2 = moment.range(moment(this.props.vacationperiod.start_date).format('YYYY-MM-DD'), moment(this.props.vacationperiod.end_date).format('YYYY-MM-DD'));
                var days2 = Array.from(range2.by('days'));
                var quotas = {};
                for (var y = 0; y < days2.length; y++) {
                    quotas[days2[y].format('YYYY-MM-DD')] = 0;
                }


                for (var i = 0; i < vacations.length; i++) {

                    var range1 = moment.range(moment(vacations[i].start_date).format('YYYY-MM-DD'), moment(vacations[i].end_date).format('YYYY-MM-DD'));
                    var days1 = Array.from(range1.by('days'));
                    vacations[i].key = vacations[i].id;
                    vacations[i].unconfirmed = 0;
                    vacations[i].status = 0;
                    for (var y = 0; y < days1.length; y++) {
                        vacations[i][days1[y].format('YYYY-MM-DD')] = true;
                        // quotas[days1[y].format('YYYY-MM-DD')]++;
                    }
                }
                vacations.unshift(
                    {
                        emp_no: "Quotas",
                        key: "quotas",

                    }
                )


                for (var y = 0; y < days2.length; y++) {
                    vacations[0][days2[y].format('YYYY-MM-DD')] = quotas[days2[y].format('YYYY-MM-DD')];
                }

                this.setState({ vacations });
                this.setState({ loading: false });
            })
    }
    optimize() {
        var dataSource = [...this.state.vacations];
        var highestindex = 1;
        for (var i = 1; i < dataSource.length; i++) {
            dataSource[i].length = 0;
            for (var key in dataSource[i]) {
                if (dataSource[i][key] === true) {
                    dataSource[i].length++;
                }
            }
        }
        var unsorted = true;
        while (unsorted) {
            unsorted = false;
            for (var i = 1; i < dataSource.length - 1; i++) {
                if (dataSource[i].length < dataSource[i + 1].length) {
                    var firstvalue = dataSource[i];
                    var secondvalue = dataSource[i + 1];
                    dataSource[i] = secondvalue;
                    dataSource[i + 1] = firstvalue;
                    unsorted = true;
                }

            }
        }
        for (var i = 1; i < dataSource.length; i++) {
            var compatible = true;
            for (var key in dataSource[i]) {
                if ((dataSource[0][key] + 1) > 5 || dataSource[i].status === 2) {
                    compatible = false;
                    break;
                }
            }

            if (!compatible) {
                if (dataSource[i].status === 0) {
                    dataSource[i].status = 2;
                }
            }
            if (compatible) {
                if (dataSource[i].status == 0) {
                    dataSource[i].status = 1;
                    for (var key in dataSource[i]) {
                        if (dataSource[i][key] === true) {
                            dataSource[0][key]++;
                        }
                    }
                }
                for (var y = 1; y < dataSource.length; y++) {
                    if (dataSource[y].vacation_no == dataSource[i].vacation_no &&
                        dataSource[y].emp_no == dataSource[i].emp_no &&
                        dataSource[y].key != dataSource[i].key
                    ) {
                        if (dataSource[y].status === 0) {
                            dataSource[y].status = 2;
                        }
                    }
                }
            }
        }
        this.setState({ vacations: dataSource });
    }


    render() {

        return (
            <div>
                <Button className="editable-add-btn" type="primary" onClick={this.optimize}>Optimize</Button>

                <Table loading={this.state.loading} pagination={false} scroll={{ x: 4300 }} size="middle" columns={this.state.columns} bordered dataSource={this.state.vacations} />
            </div>
        );
    }

}

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