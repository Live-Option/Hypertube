import React					from 'react'
import { connect }				from 'react-redux'
import { selectAuth }			from '../../../action/auth'
import lang						from '../../../lang'
import colors					from '../../../colors/colors'

import TextField				from 'material-ui/TextField'
import FlatButton				from 'material-ui/FlatButton'

const textFieldSet = {
	className: 'textInp',
	autoComplete: 'off',
	floatingLabelFocusStyle: { color: colors.deepPurple },
	underlineFocusStyle: { borderColor: colors.deepPurple }
}

class ForgotPassForm extends React.Component {
	_mounted = false

	state = {
		mail: null,
		mailR: null,
	}

	componentDidMount() {
		this._mounted = true
	}

	componentWillUnmount() {
		this._mounted = false
	}

	handleChange = (e) => {
		const up = {}
		up[e.target.name] = e.target.value
		this.setState({ ...up })
	}

	forgot = () => {
		const data = {
			mail: this.state.mail,
		}
		console.log(data)
		this.props.dispatch(selectAuth(3))
	}

	render() {
		const { l } = this.props
		const { mailR } = this.state
		return (
			<form className="authForm" onChange={this.handleChange}>
				<TextField
			    	floatingLabelText={lang.mail[l]}
					name="mail"
					type="text"
					errorText={mailR}
					{ ...textFieldSet }
    			/>
				<FlatButton
					label={lang.SENDMEANEMAIL[l]}
					style={{ width: '80%', marginTop: '20px' }}
					onClick={this.forgot}
				/>
			</form>
		)
	}
}

const mapStateToProps = ({ lang }) => ({ l: lang.l })

export default connect(mapStateToProps)(ForgotPassForm)
