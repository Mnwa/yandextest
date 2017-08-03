var MyFormInit = (function () {
    function MyFormInit(formID, submitButtonID, resultContainerID) {
        var _this = this;
        this.__form = this.__getFormById(formID);
        this.__submitButton = document.getElementById(submitButtonID);
        this.__resultContainer = document.getElementById(resultContainerID);
        if (this.__form === undefined || this.__submitButton === undefined || this.__resultContainer === undefined) {
            throw new Error('Один из элементов с указанным id отсутствует.');
        }
        this.__form.onsubmit = function (e) {
            e.preventDefault();
            _this.submit();
        };
        window['MaskedInput']({
            elm: this.__form.elements['phone'],
            format: '+7(___)___-__-__',
            separator: '+7()-'
        });
    }
    MyFormInit.prototype.validate = function () {
        var errorFields = [];
        var valid = true;
        if (this.__validateFIO() === false) {
            valid = false;
            errorFields.push(this.__form.elements['fio'].name);
        }
        if (this.__validateEmail() === false) {
            valid = false;
            errorFields.push(this.__form.elements['email'].name);
        }
        if (this.__validatePhone() === false) {
            valid = false;
            errorFields.push(this.__form.elements['phone'].name);
        }
        return {
            isValid: valid,
            errorFields: errorFields
        };
    };
    MyFormInit.prototype.getData = function () {
        return {
            fio: this.__form.elements['fio'].value,
            email: this.__form.elements['email'].value,
            phone: this.__form.elements['phone'].value
        };
    };
    MyFormInit.prototype.setData = function (obj) {
        var fio = obj.fio, phone = obj.phone, email = obj.email;
        this.__form.elements['fio'].value = fio;
        this.__form.elements['phone'].value = phone;
        this.__form.elements['email'].value = email;
    };
    MyFormInit.prototype.submit = function () {
        var _this = this;
        var _a = this.validate(), isValid = _a.isValid, errorFields = _a.errorFields;
        this.__form.elements['fio'].className = this.__form.elements['fio'].className.replace('error', '');
        this.__form.elements['email'].className = this.__form.elements['email'].className.replace('error', '');
        this.__form.elements['phone'].className = this.__form.elements['phone'].className.replace('error', '');
        if (isValid === true) {
            fetch(this.__form.action)
                .then(function (res) { return res.json(); })
                .then(function (data) {
                if (data.status === 'success') {
                    _this.__submitButton.setAttribute('disabled', 'disabled');
                    _this.__resultContainer.className = 'success';
                    _this.__resultContainer.innerText = 'Success';
                }
                if (data.status === 'error') {
                    _this.__resultContainer.className = 'error';
                    _this.__resultContainer.innerText = data.reason;
                }
                if (data.status === 'progress') {
                    _this.__resultContainer.className = 'progress';
                    setTimeout(function () {
                        _this.submit();
                    }, Number(data.timeout));
                }
            })
                .catch(function (err) { return console.error(err); });
        }
        else {
            errorFields.forEach(function (name) {
                if (_this.__form.elements['fio'].name === name) {
                    _this.__form.elements['fio'].className = 'error';
                }
                if (_this.__form.elements['email'].name === name) {
                    _this.__form.elements['email'].className = 'error';
                }
                if (_this.__form.elements['phone'].name === name) {
                    _this.__form.elements['phone'].className = 'error';
                }
            });
        }
    };
    MyFormInit.prototype.__validateFIO = function () {
        var fioValid = this.__form.elements['fio'].value.split(" ").filter(function (val) { return Boolean(val); });
        return fioValid.length === 3;
    };
    MyFormInit.prototype.__validateEmail = function () {
        var emailReg = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((ya\.ru)|(yandex\.ru)|(yandex\.ua)|(yandex\.by)|(yandex\.kz)|(yandex\.com))$/g;
        return emailReg.test(this.__form.elements['email'].value);
    };
    MyFormInit.prototype.__validatePhone = function () {
        var phoneReg = /^\+7\([0-9]{3}\)[0-9]{3}-[0-9]{2}-[0-9]{2}$/;
        var phoneSum = this.__form.elements['phone'].value
            .split("")
            .map(function (val) { return Number(val); })
            .filter(function (val) { return !isNaN(val); })
            .reduce(function (a, b) { return a + b; }, 0);
        return phoneSum <= 30 && phoneReg.test(this.__form.elements['phone'].value);
    };
    MyFormInit.prototype.__getFormById = function (id) {
        for (var index = 0; index < document.forms.length; index++) {
            if (document.forms[index].id === id) {
                return document.forms[index];
            }
        }
    };
    return MyFormInit;
}());
var MyForm = new MyFormInit('myForm', 'submitButton', 'resultContainer');
