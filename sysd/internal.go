package sysd

import "github.com/paasbox/paasbox/assets"

func loadInternal(f string) ([]byte, error) {
	return assets.Asset("workspaces/" + f + ".json")
}
