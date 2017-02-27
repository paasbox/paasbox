package env

import "strings"

// Replace ...
func Replace(val string, env []string) string {
	vars := map[string]string{}
	for _, e := range env {
		v := strings.SplitN(e, "=", 2)
		if len(v) < 2 {
			continue
		}
		vars[v[0]] = replace(v[1], vars)
	}
	return replace(val, vars)
}

func replace(val string, vars map[string]string) (ret string) {
	var escaped bool
	var isVarName bool
	var varName string

	//log.Printf("%+v", vars)

	for _, c := range val {
		//log.Println("parse", pos, string(c))
		if c == '\\' {
			escaped = !escaped
			ret += string(c)
			continue
		} else {
			escaped = false
		}
		if c == '$' && !escaped {
			//log.Println("found $")
			if isVarName {
				// Starting a new var
				ret += "$" + varName
				if rep, ok := vars[varName]; ok {
					// Found a match
					//log.Println("matched", varName, rep)
					ret += rep
				}
				varName = ""
			}
			isVarName = true
			continue
		}
		if isVarName {
			varName = varName + string(c)
			if rep, ok := vars[varName]; ok {
				// Found a match
				//log.Println("matched", varName, rep)
				varName = ""
				ret += rep
				isVarName = false
			}
			continue
		}
		ret += string(c)
	}
	ret += varName

	return
}
